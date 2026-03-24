export const config = {
  firebase: {
    apiKey: import.meta.env.FIREBASE_API_KEY || "your-api-key",
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN || "your-auth-domain",
    projectId: import.meta.env.FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
    messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
    appId: import.meta.env.FIREBASE_APP_ID || "your-app-id"
  },
  auth: {
    cookieName: "life_expense_session",
    cookieExpiresInHours: 72,
    passwordSaltRounds: 10
  }
};
