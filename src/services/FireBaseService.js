import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
//import { getFirestore, collection, addDoc } from "firebase/firestore";
class FireBaseService {
    instance = null;
    #firebaseConfig = {
        apiKey: "AIzaSyAxcCSCYnJD0l6eZZelLIF4sDkqgXySECE",
        authDomain: "lifeexpensetracker.firebaseapp.com",
        projectId: "lifeexpensetracker",
        storageBucket: "lifeexpensetracker.appspot.com",
        messagingSenderId: "657525821766",
        appId: "1:657525821766:web:3a12ab7cec57b004d31547",
        measurementId: "G-TEKZNNYK7H",
        databaseURL: ""
    };
    #app = null;
    constructor() {
        this.#app = initializeApp(this.#firebaseConfig);
    }
    static getInstance() {
        if (this.instance == null) {
            this.instance = new FireBaseService();
        }
        return this.instance;
    }
    async get(collectionName, documentId) {
        try {
            const db = getFirestore(this.#app);
            const collectionRef = collection(db, collectionName);
            const docRef = await getDocs(collectionRef);
            const docs = docRef.docs.map(doc => {
                return {
                    id: doc.id,
                    ...doc.data()
                }
            });
            return Promise.resolve(docs);
        } catch (error) {
            console.log('Firebase error', error);
            return Promise.reject(error);
        }

    }
    async set(collectionName, data) {
        try {
            const db = getFirestore(this.#app);
            const dbRef = collection(db, collectionName);
            await addDoc(dbRef, data);
            return Promise.resolve();
        } catch (error) {
            console.log('Firebase error', error);
            return Promise.reject(error);
        }
    }
    async deleteDocument(collectioName, documentId) {
        try {
            const db = getFirestore(this.#app);
            await deleteDoc(doc(db, collectioName, documentId));
            return Promise.resolve();
        } catch (error) {
            console.log('Firebase error', error);
            return Promise.reject(error);
        }
    }

}
export default FireBaseService