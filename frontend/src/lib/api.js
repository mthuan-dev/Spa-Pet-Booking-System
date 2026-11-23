// Axios
// interceptors

import Axios from 'axios';
import { BACKEND_ENDPOINT } from '~/app/config/env.js';
import { getSession } from '~/features/auth/utils/session.js';
import { mockAdapter } from '~/mocks/admin/api.js';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

function authRequestInterceptor(config) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    
    // Read token from localStorage or sessionStorage
    const token = getSession();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  /* Cho phép gửi các thông tin xác thực
  (Cookie, AuthorizationHeader, TLS..)
    Kiểm tra CORS -> Phải trả về chính xác domain FE.
  */
  config.withCredentials = true;
  return config;
}

// Tạo instance Axios (.get, .post, .put, .delete)
export const api = Axios.create({
  baseURL: BACKEND_ENDPOINT,
  ...(USE_MOCK_API ? { adapter: mockAdapter } : {}), //
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);
