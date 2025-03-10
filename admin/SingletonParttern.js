import { API_URL } from "./src/config";


class ApiConfig {
    static instance;

    constructor() {
        if (!ApiConfig.instance) {
            this.apiUrl = API_URL;
            ApiConfig.instance = this;
        }
        return ApiConfig.instance;
    }

    getApiUrl() {
        return this.apiUrl;
    }
}

// Xuất ra một instance duy nhất
const apiConfigInstance = new ApiConfig();
export default apiConfigInstance;
