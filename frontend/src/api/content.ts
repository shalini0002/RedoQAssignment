// src/api/content.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://redoqassignment.onrender.com';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface Content {
  _id: string;
  title: string;
  body: string;
  status: 'DRAFT' | 'REVIEW_1' | 'REVIEW_2' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  isEditable: boolean;
  rejectionReason?: string;
  approvedBy: Array<{ role: string; timestamp: Date }>;
  createdAt: string;
  updatedAt: string;
}

export const fetchContent = async () => {
  try {
    console.log('Fetching content from:', `${API_URL}/api/content`);
    const response = await axios.get<Content[]>(`${API_URL}/api/content`);
    console.log('Fetch content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const getContentById = async (id: string) => {
  try {
    console.log('Fetching content by ID:', id);
    const response = await axios.get<Content>(`${API_URL}/api/content/${id}`);
    console.log('Fetch content by ID response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const createContent = async (data: Partial<Content>, role?: string) => {
  try {
    console.log('Creating content:', { ...data, role });
    const response = await axios.post<Content>(`${API_URL}/api/content`, { ...data, role });
    console.log('Create content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error creating content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const updateContent = async (id: string, data: Partial<Content>, role?: string) => {
  try {
    console.log('Updating content:', id, { ...data, role });
    const response = await axios.put<Content>(`${API_URL}/api/content/${id}`, { ...data, role });
    console.log('Update content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const submitContent = async (id: string, role?: string) => {
  try {
    console.log('Submitting content:', id, role);
    const response = await axios.post<Content>(`${API_URL}/api/content/${id}/submit`, { role });
    console.log('Submit content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error submitting content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const approveContent = async (id: string, role: string) => {
  try {
    console.log('Approving content:', id, role);
    const response = await axios.post<Content>(`${API_URL}/api/content/${id}/approve`, { role });
    console.log('Approve content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error approving content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const rejectContent = async (id: string, role: string, comment: string) => {
  try {
    console.log('Rejecting content:', id, role, comment);
    const response = await axios.post<Content>(`${API_URL}/api/content/${id}/reject`, { role, comment });
    console.log('Reject content response:', response.data);
    return response;
  } catch (error) {
    console.error('Error rejecting content:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};

export const getAvailableActions = async (id: string, role: string) => {
  try {
    console.log('Getting available actions:', id, role);
    const response = await axios.get<{ actions: string[] }>(`${API_URL}/api/content/${id}/actions?role=${role}`);
    console.log('Get available actions response:', response.data);
    return response;
  } catch (error) {
    console.error('Error getting available actions:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data, error.response?.status);
    }
    throw error;
  }
};