import { initializeApp, cert, getApps, getApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccountKey from './serviceAccountKey.json';

const serviceAccount = serviceAccountKey as ServiceAccount;

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

const adminAuth = getAuth(app);

export { adminAuth };
