export const API_BASE_URL = 'http://127.0.0.1:8000'; // 統一管理網址

export const getAuthHeaders = () => {
  // 這裡確保抓取最新的 Token
  const token = localStorage.getItem('userToken');
  
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Basic ${token}` : "",
  };
};

// 通用的 fetch 函式來簡化程式碼
export const apiRequest = async (endpoint: string, options: any = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return response;
};