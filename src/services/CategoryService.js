import FireBaseService from "./FireBaseService";
class CategoryService {
    instance = null;
    #localStorageKey = "";
    #fb = null;
    #categoryCollectionName = 'expense-type';
    constructor() {
        this.#localStorageKey = "CATEGORIES";
        this.#fb = FireBaseService.getInstance();
    }
    static getInstance() {
        if (this.instance == null) {
            this.instance = new CategoryService();
        }
        return this.instance;
    }
    async #refreshCacheOfCategory() {
        console.log('refresh called');
        const data = await this.#fb.get(this.#categoryCollectionName);
        window.localStorage[this.#localStorageKey] = JSON.stringify(data);
    }
    async getCategory() {
        if (window.localStorage[this.#localStorageKey] && window.localStorage[this.#localStorageKey] !== '') {
            this.#refreshCacheOfCategory();
        } else {
            await this.#refreshCacheOfCategory()
        }
        return JSON.parse(window.localStorage[this.#localStorageKey]);
    }
    async #syncNewCategoryToFB(data) {
        await this.#fb.set(this.#categoryCollectionName, data);
    }
    setCategory(newCategoryData) {
        try {
            let existingData;
            if (window.localStorage[this.#localStorageKey] && window.localStorage[this.#localStorageKey] !== '') {
                existingData = JSON.parse(window.localStorage[this.#localStorageKey]);
            }
            const dataToInsert = { title: newCategoryData.title, value: newCategoryData.value };
            existingData.push(dataToInsert);
            this.#syncNewCategoryToFB(dataToInsert);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
export default CategoryService;