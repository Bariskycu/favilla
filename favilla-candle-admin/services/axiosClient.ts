import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Use a new instance or raw axios to avoid interceptors
                    const response = await axios.post(`${baseURL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
            } else {
                console.warn('[AxiosClient] No refresh token available. Logging out.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken'); // Just in case
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
