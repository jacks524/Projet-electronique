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
                    config.headers.Authorization = token.startsWith('Bearer ')
                        ? token
                        : `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error?.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);
export default apiClient;
