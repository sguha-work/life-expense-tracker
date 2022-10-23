import { initializeApp } from "firebase/app";
class FireBaseService {
    #instance = null;
    #firebaseConfig = {
        apiKey: "AIzaSyAxcCSCYnJD0l6eZZelLIF4sDkqgXySECE",
        authDomain: "lifeexpensetracker.firebaseapp.com",
        projectId: "lifeexpensetracker",
        storageBucket: "lifeexpensetracker.appspot.com",
        messagingSenderId: "657525821766",
        appId: "1:657525821766:web:3a12ab7cec57b004d31547",
        measurementId: "G-TEKZNNYK7H"
      };
      app = null;
    constructor() {
        this.app = initializeApp(this.#firebaseConfig);
    }
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new FireBaseService();
        }
        return this.#instance;
    }
    
}
export default FireBaseService