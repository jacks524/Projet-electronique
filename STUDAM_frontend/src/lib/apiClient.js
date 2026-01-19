import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://projet-electronique.onrender.com/api';

// 2. On crée une seule instance d'Axios qui sera utilisée partout.
const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const publicRoutes = ['/user/signin', '/user/register'];
        if (!publicRoutes.includes(config.url)) {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = token;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default apiClient;
