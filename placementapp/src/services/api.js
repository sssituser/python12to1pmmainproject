import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

export const leaveRequestAPI = {
  // Get all leave requests
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-requests/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  },

  // Create new leave request
  create: async (leaveData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave-requests/create/`, leaveData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  },

  // Update leave request
  update: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leave-requests/${id}/update/`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  },

  // Delete leave request
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/leave-requests/${id}/delete/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }
};
