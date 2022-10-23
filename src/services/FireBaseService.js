class FireBaseService {
    #instance = null;
    constructor() {

    }
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new FireBaseService();
        }
        return this.#instance;
    }
    
}
export default FireBaseService