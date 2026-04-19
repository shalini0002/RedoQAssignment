// src/api/content.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://redoqassignment.onrender.com';

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

export const fetchContent = () => axios.get<Content[]>(`${API_URL}/api/content`);
export const getContentById = (id: string) => axios.get<Content>(`${API_URL}/api/content/${id}`);
export const createContent = (data: Partial<Content>, role?: string) => 
  axios.post<Content>(`${API_URL}/api/content`, { ...data, role });
export const updateContent = (id: string, data: Partial<Content>, role?: string) => 
  axios.put<Content>(`${API_URL}/api/content/${id}`, { ...data, role });
export const submitContent = (id: string, role?: string) => axios.post<Content>(`${API_URL}/api/content/${id}/submit`, { role });
export const approveContent = (id: string, role: string) =>
  axios.post<Content>(`${API_URL}/api/content/${id}/approve`, { role });
export const rejectContent = (id: string, role: string, comment: string) =>
  axios.post<Content>(`${API_URL}/api/content/${id}/reject`, { role, comment });

export const getAvailableActions = (id: string, role: string) =>
  axios.get<{ actions: string[] }>(`${API_URL}/api/content/${id}/actions?role=${role}`);