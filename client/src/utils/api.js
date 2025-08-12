import axios from 'axios';
import { toast } from 'react-toastify';

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Axios interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      requestData: error.config?.data,
      headers: error.config?.headers,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const getAllVideos = async () => {
  try {
    const response = await api.get("/video/allvideos", {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch videos");
    throw error;
  }
};

export const getAllNotes = async () => {
  try {
    const response = await api.get("/note/allnotes", {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch notes");
    throw error;
  }
};

export const getAllAnnouncements = async () => {
  try {
    const response = await api.get("/announcement/allann", {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch announcements");
    throw error;
  }
};

export const getMyAnnouncements = async (userEmail) => {
  try {
    const response = await api.get(`/announcement/myann?email=${userEmail}`, {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch your announcements");
    throw error;
  }
};

export const getMyVideos = async (userEmail) => {
  try {
    const response = await api.get(`/video/myvideos?email=${userEmail}`, {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Get my videos error:", error);
    toast.error("Failed to fetch your videos");
    throw error;
  }
};

export const getMyNotes = async (userEmail) => {
  try {
    const response = await api.get(`/note/mynotes?email=${userEmail}`, {
      timeout: 10 * 1000,
    });
    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Get my notes error:", error);
    toast.error("Failed to fetch your notes");
    throw error;
  }
};