import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = localStorage.getItem('USER_TOKEN');
  const beneficiaryUuid = localStorage.getItem('BENEFICIARY_UUID');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (beneficiaryUuid && !config.headers['beneficiaryUuid']) {
    config.headers['beneficiaryUuid'] = beneficiaryUuid;
  }
  return config;
});

export default api;
