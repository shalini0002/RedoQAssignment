// src/api/content.ts
import axios from "axios";

const API = "http://localhost:5001/api/content";

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

export const fetchContent = () => axios.get<Content[]>(API);
export const getContentById = (id: string) => axios.get<Content>(`${API}/${id}`);
export const createContent = (data: Partial<Content>, role?: string) => 
  axios.post<Content>(API, { ...data, role });
export const updateContent = (id: string, data: Partial<Content>, role?: string) => 
  axios.put<Content>(`${API}/${id}`, { ...data, role });
export const submitContent = (id: string, role?: string) => axios.post<Content>(`${API}/${id}/submit`, { role });
export const approveContent = (id: string, role: string) =>
  axios.post<Content>(`${API}/${id}/approve`, { role });
export const rejectContent = (id: string, role: string, comment: string) =>
  axios.post<Content>(`${API}/${id}/reject`, { role, comment });

export const getAvailableActions = (id: string, role: string) =>
  axios.get<{ actions: string[] }>(`${API}/${id}/actions?role=${role}`);