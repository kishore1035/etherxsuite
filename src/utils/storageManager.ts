/**
 * Storage Manager - Quota-aware localStorage helper
 *
 * Provides safe write operations that automatically evict stale/orphaned data
 * when localStorage is near or at quota limit.
 */

const QUOTA_WARN_BYTES = 4 * 1024 * 1024;  // 4 MB - start evicting
const QUOTA_MAX_BYTES = 5 * 1024 * 1024;  // 5 MB - browser hard limit (approx)

// Prefixes considered "evictable" (sheet cache, not the spreadsheet index itself)
const EVICTABLE_PREFIXES = [
    'sheets:data:',
    'sheets:hash:',
    'sheets:timestamp:',
];

// Prefixes that should NEVER be evicted (user identity, recent list, meta)
const PROTECTED_PREFIXES = [
    'recent_sheets_',
    'user_name_',
    'user_phone_',
    'owner_links_',
    'collaboration_links_',
    'collaboration_access_',
    'active_collaborators_',
    'favoriteTemplates:',
    'notifications_',
];

/**
 * Estimate total localStorage usage in bytes
 */
export function estimateStorageUsage(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const val = localStorage.getItem(key) || '';
            total += (key.length + val.length) * 2; // UTF-16 chars = 2 bytes each
        }
    }
    return total;
}

/**
 * A human-readable size string
 */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface StorageEntry {
    key: string;
    size: number;
    protected: boolean;
    evictable: boolean;
}

function isProtected(key: string): boolean {
    return PROTECTED_PREFIXES.some(p => key.startsWith(p));
}

function isEvictable(key: string): boolean {
    return EVICTABLE_PREFIXES.some(p => key.startsWith(p));
}

/**
 * Get all storage entries with their sizes
 */
function getAllEntries(): StorageEntry[] {
    const entries: StorageEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || '';
        const size = (key.length + val.length) * 2;
        entries.push({
            key,
            size,
            protected: isProtected(key),
            evictable: isEvictable(key),
        });
    }
    return entries;
}

/**
 * Evict old spreadsheet data to free up space.
 * Strategy:
 *  1. Remove orphaned sheet cache entries (sheets:data/hash/timestamp) not in any recent list
 *  2. Remove the oldest spreadsheet entries beyond the most recent N
 *  3. Remove any temp/duplicated IPFS snapshot keys
 */
export function evictStaleData(targetFreeBytes: number = 1024 * 1024): number {
    let freed = 0;
    console.log(`🧹 Storage eviction started — target: free ${formatBytes(targetFreeBytes)}`);

    // --- Step 1: Remove orphaned sheet cache entries ---
    // Collect all sheet IDs referenced in recent lists
    const liveSheetIds = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('recent_sheets_')) {
            try {
                const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
                ids.forEach(id => liveSheetIds.add(id));
            } catch { /* ignore */ }
        }
        if (key.startsWith('spreadsheet_')) {
            try {
                const doc = JSON.parse(localStorage.getItem(key) || '{}');
                const docId = doc.documentId || doc.id;
                if (docId) liveSheetIds.add(docId);
                // Also add any sheet-level IDs within the doc
                const sheets = doc.sheets || [];
                sheets.forEach((s: any) => { if (s.sheetId) liveSheetIds.add(s.sheetId); });
            } catch { /* ignore */ }
        }
    }

    // Remove sheet cache for IDs not in any live spreadsheet
    const cacheEntries = getAllEntries().filter(e => e.evictable);
    for (const entry of cacheEntries) {
        const sheetId = entry.key.replace(/^sheets:(data|hash|timestamp):/, '');
        if (!liveSheetIds.has(sheetId)) {
            const size = entry.size;
            localStorage.removeItem(entry.key);
            freed += size;
            console.log(`  🗑️ Removed orphaned cache ${entry.key} (${formatBytes(size)})`);
        }
        if (freed >= targetFreeBytes) break;
    }

    if (freed >= targetFreeBytes) {
        console.log(`✅ Eviction done — freed ${formatBytes(freed)}`);
        return freed;
    }

    // --- Step 2: Remove stale spreadsheet_ duplicates (keep only most recent per documentId) ---
    const spreadsheetEntries = getAllEntries()
        .filter(e => e.key.startsWith('spreadsheet_') && !e.protected)
        .sort((a, b) => b.size - a.size); // largest first

    // Detect and remove clearly duplicate "snapshot" keys written by DocumentStateContext
    // These look like: spreadsheet_email@example.com_1771554120455 (email + timestamp)
    const snapshotPattern = /^spreadsheet_.+_\d{13}$/;
    for (const entry of spreadsheetEntries) {
        if (snapshotPattern.test(entry.key)) {
            const size = entry.size;
            localStorage.removeItem(entry.key);
            freed += size;
            console.log(`  🗑️ Removed IPFS snapshot backup ${entry.key} (${formatBytes(size)})`);
        }
        if (freed >= targetFreeBytes) break;
    }

    console.log(`✅ Eviction done — freed ${formatBytes(freed)}`);
    return freed;
}

/**
 * Safe localStorage.setItem that evicts data if needed before writing.
 * Returns true if the write succeeded, false if it failed permanently.
 */
export function safeSetItem(key: string, value: string): boolean {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (err: any) {
        if (err?.name !== 'QuotaExceededError' && !err?.message?.includes('quota')) {
            console.error('❌ Storage write failed (non-quota error):', err);
            return false;
        }

        // Quota exceeded — try to evict and retry
        const valueSize = (key.length + value.length) * 2;
        console.warn(`⚠️ Quota exceeded writing "${key}" (${formatBytes(valueSize)}). Evicting stale data...`);

        try {
            const freed = evictStaleData(valueSize + 512 * 1024); // free value size + 512KB buffer
            if (freed > 0) {
                try {
                    localStorage.setItem(key, value);
                    console.log(`✅ Write succeeded after evicting ${formatBytes(freed)}`);
                    return true;
                } catch (err2) {
                    console.error('❌ Write still failed after eviction:', err2);
                    return false;
                }
            }
        } catch (evictErr) {
            console.error('❌ Eviction failed:', evictErr);
        }
        return false;
    }
}

/**
 * Run a proactive cleanup (called at app startup or on dashboard mount)
 * Removes all IPFS snapshot backup keys unconditionally since they are not needed
 * (the actual spreadsheet data is stored under 'spreadsheet_{documentId}')
 */
export function cleanupIPFSSnapshotBackups(): void {
    const pattern = /^spreadsheet_.+_\d{13}$/;
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && pattern.test(key)) toDelete.push(key);
    }
    if (toDelete.length > 0) {
        toDelete.forEach(k => localStorage.removeItem(k));
        console.log(`🧹 Removed ${toDelete.length} stale IPFS snapshot backup key(s)`);
    }
}

/**
 * Limit recent spreadsheet entries to a max count, evicting oldest
 */
export function limitSpreadsheetCount(userEmail: string, maxCount: number = 20): void {
    const recentKey = `recent_sheets_${userEmail}`;
    try {
        const ids: string[] = JSON.parse(localStorage.getItem(recentKey) || '[]');
        if (ids.length <= maxCount) return;

        const excess = ids.splice(maxCount); // trim to maxCount, excess are the oldest
        localStorage.setItem(recentKey, JSON.stringify(ids));

        // Remove the actual spreadsheet data for evicted IDs
        for (const id of excess) {
            localStorage.removeItem(`spreadsheet_${id}`);
            // Also clear their sheet cache
            localStorage.removeItem(`sheets:data:${id}`);
            localStorage.removeItem(`sheets:hash:${id}`);
            localStorage.removeItem(`sheets:timestamp:${id}`);
        }
        console.log(`🧹 Trimmed ${excess.length} old spreadsheet(s) from recent list`);
    } catch { /* ignore */ }
}
