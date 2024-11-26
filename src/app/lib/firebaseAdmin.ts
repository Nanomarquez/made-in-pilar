import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccountKey from './serviceAccountKey.json';

const accessKey = JSON.parse(JSON.stringify(serviceAccountKey));

const app = !getApps().length
  ? initializeApp({
      credential: cert(accessKey),
    })
  : getApp();

console.log({app});

const adminAuth = getAuth(app);

export { adminAuth };
