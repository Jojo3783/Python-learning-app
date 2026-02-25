const API_BASE_URL = 'http://127.0.0.1:8000';  // 之後要改電腦的實際 IP 位址

export const apiService = {
  // 測試基本連接
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API 連接失敗:', error);
      throw error;
    }
  },

  // 檢查環境變數 (檢查金鑰是否載入)
  async checkEnv() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkenv`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('檢查環境失敗:', error);
      throw error;
    }
  },
};