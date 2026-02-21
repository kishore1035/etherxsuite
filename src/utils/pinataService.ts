import axios from 'axios';

// ─── Hardcoded Pinata credentials ────────────────────────────────────────────
const PINATA_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOWY0ZGUxYS0wNWVlLTQ5YjAtOTBmYS02MjdhYzk2OTljZTEiLCJlbWFpbCI6ImV0aGVyeGV4Y2VsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4Zjc5ZDJjNGI3YTM3ZWJhMjllYyIsInNjb3BlZEtleVNlY3JldCI6ImM1NmZhNzJjOGMzZDJjMDdhY2UxNDVkNGY3MTI2ZWM1MWFlN2NjODIwNjI4MTMzOTI4MDM1OWU4YzAzNTc4ODIiLCJleHAiOjE4MDI1OTIyOTN9.WkiivLuxUYThJagDphXZxFDDaKFKSzX0C4ddGX_0NVg';

// Rate-limiting state
let lastUploadTime = 0;
const MIN_UPLOAD_INTERVAL = 5000; // 5 s between uploads
let uploadQueue: Array<{ resolve: Function; reject: Function; data: any; filename: string }> = [];
let isProcessingQueue = false;
let ipfsEnabled = true;

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

// Process upload queue with rate limiting
const processUploadQueue = async () => {
  if (isProcessingQueue || uploadQueue.length === 0) return;
  isProcessingQueue = true;

  while (uploadQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastUpload = now - lastUploadTime;
    if (timeSinceLastUpload < MIN_UPLOAD_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_UPLOAD_INTERVAL - timeSinceLastUpload));
    }
    const item = uploadQueue.shift();
    if (!item) continue;
    try {
      const result = await uploadToIPFSInternal(item.data, item.filename);
      lastUploadTime = Date.now();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }

  isProcessingQueue = false;
};

// Internal upload (no rate-limiting wrapper)
const uploadToIPFSInternal = async (data: any, filename: string): Promise<PinataResponse> => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: data,
        pinataMetadata: { name: filename },
        pinataOptions: { cidVersion: 1 },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      ipfsEnabled = false;
      throw new Error(
        'IPFS_DISABLED: ' +
        (error.response?.data?.error?.reason ||
          error.response?.data?.message ||
          'Authentication failed')
      );
    }
    throw error;
  }
};

// Public upload with rate-limiting queue
export const uploadToIPFS = async (data: any, filename: string): Promise<PinataResponse> => {
  if (!ipfsEnabled) {
    throw new Error('IPFS uploads are currently disabled due to authentication issues');
  }
  return new Promise((resolve, reject) => {
    uploadQueue.push({ resolve, reject, data, filename });
    processUploadQueue();
  });
};

// Retrieve data from IPFS
export const getFromIPFS = async (hash: string): Promise<any> => {
  const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
  return response.data;
};

// Save user credentials to IPFS
export const saveUserCredentials = async (email: string, password: string): Promise<string> => {
  const result = await uploadToIPFS(
    { email, password, createdAt: new Date().toISOString() },
    `user_${email}`
  );
  return result.IpfsHash;
};

// Save spreadsheet data to IPFS
export const saveSpreadsheetToIPFS = async (data: any, metadata?: any): Promise<string> => {
  const result = await uploadToIPFS(
    { data, metadata: { ...metadata, savedAt: new Date().toISOString(), version: '1.0' } },
    `spreadsheet_${Date.now()}`
  );
  return result.IpfsHash;
};

// Load spreadsheet data from IPFS
export const loadSpreadsheetFromIPFS = async (hash: string): Promise<any> => {
  return await getFromIPFS(hash);
};

// Save user data mapping
export const saveUserDataMapping = async (email: string, mappings: any): Promise<string> => {
  const result = await uploadToIPFS(
    { email, mappings, lastUpdated: new Date().toISOString() },
    `user_mapping_${email}`
  );
  return result.IpfsHash;
};

// Get user data mapping
export const getUserDataMapping = async (hash: string): Promise<any> => {
  return await getFromIPFS(hash);
};

// Auto-save to IPFS
export const autoSaveToIPFS = async (
  data: any,
  type: 'spreadsheet' | 'credentials' | 'settings'
): Promise<string> => {
  const timestamp = Date.now();
  const result = await uploadToIPFS(
    { type, data, timestamp, autoSaved: true },
    `autosave_${type}_${timestamp}`
  );
  return result.IpfsHash;
};
