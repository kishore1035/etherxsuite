// ─── Hardcoded Production Configuration ──────────────────────────────────────
// All credentials are embedded directly for zero-config deployment.

// ── Pinata / IPFS ─────────────────────────────────────────────────────────────
const PINATA_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOWY0ZGUxYS0wNWVlLTQ5YjAtOTBmYS02MjdhYzk2OTljZTEiLCJlbWFpbCI6ImV0aGVyeGV4Y2VsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4Zjc5ZDJjNGI3YTM3ZWJhMjllYyIsInNjb3BlZEtleVNlY3JldCI6ImM1NmZhNzJjOGMzZDJjMDdhY2UxNDVkNGY3MTI2ZWM1MWFlN2NjODIwNjI4MTMzOTI4MDM1OWU4YzAzNTc4ODIiLCJleHAiOjE4MDI1OTIyOTN9.WkiivLuxUYThJagDphXZxFDDaKFKSzX0C4ddGX_0NVg';
const PINATA_API_KEY = '8f79d2c4b7a37eba29ec';
const PINATA_SECRET_KEY =
  'c56fa72c8c3d2c07ace145d4f7126ec51ae7cc820628133928035 9e8c0357882';

// ── EmailJS ────────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_b73tfnj';
const EMAILJS_TEMPLATE_ID = 'template_pfm0j6i';
const EMAILJS_PUBLIC_KEY = '525kFqS7-tMAs3TFC';

// ── Firebase ───────────────────────────────────────────────────────────────────
const FIREBASE_API_KEY = 'AIzaSyB14OXytCuSBA-SBQcLLX0lYPWQXGiZ_IY';
const FIREBASE_AUTH_DOMAIN = 'etherx-excel.firebaseapp.com';
const FIREBASE_PROJECT_ID = 'etherx-excel';
const FIREBASE_STORAGE_BUCKET = 'etherx-excel.firebasestorage.app';
const FIREBASE_MESSAGING_SENDER_ID = '460125247936';
const FIREBASE_APP_ID = '1:460125247936:web:cc86143b42410fc9305025';
const FIREBASE_MEASUREMENT_ID = 'G-RHG1PZSBT1';

export const config = {
  isDevelopment: import.meta.env.DEV as boolean,
  isProduction: import.meta.env.PROD as boolean,

  // API — uses env var if provided, otherwise localhost for dev
  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    apiUrl: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') + '/api',
    websocketUrl: (() => {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const protocol = base.startsWith('https') ? 'wss' : 'ws';
      const host = base.replace(/^https?:\/\//, '').replace(/\/api$/, '');
      return `${protocol}://${host}/ws/collaboration`;
    })(),
    timeout: 30000,
  },

  // IPFS / Pinata
  ipfs: {
    jwt: PINATA_JWT,
    apiKey: PINATA_API_KEY,
    secretKey: PINATA_SECRET_KEY,
    enabled: true,
    uploadUrl: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs',
    dashboardUrl: 'https://app.pinata.cloud',
  },

  // EmailJS
  emailjs: {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY,
  },

  // Firebase
  firebase: {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
  },

  // Features
  features: {
    enableCollaboration: true,
    enableIPFS: true,
    enableRealTimeSync: true,
    enableOfflineMode: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    autoSaveInterval: 30000,            // 30 s
  },

  debug: import.meta.env.DEV as boolean,
  logLevel: import.meta.env.DEV ? 'debug' : 'error',
};

export default config;
