import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config } from "../configuration/configure";

// Initialize Firebase
const app = initializeApp(config.firebase);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
