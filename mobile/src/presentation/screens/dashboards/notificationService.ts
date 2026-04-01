import axios from 'axios';

const API_BASE_URL = 'https://your-backend-url.com/api';

export const fetchNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/notifications`);
  return response.data;
};

export const markAllAsRead = async () => {
  await axios.put(`${API_BASE_URL}/notifications/mark-all-read`);
};