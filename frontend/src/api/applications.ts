import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/applications`,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Application {
  _id: string;
  company_name: string;
  company_logo?: string;
  job_title: string;
  status: 'Wishlist' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
  health_score: 'HEALTHY' | 'AT_RISK' | 'STALE' | 'SUCCESS';
  location?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_url?: string;
  application_notes?: string;
  contact_person?: string;
  contact_email?: string;
  applied_date?: string;
}

export interface ActivityLog {
  _id: string;
  application_id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export const getApplications = async (pageParam = 1) => {
  const { data } = await api.get<Application[]>(`/?page=${pageParam}&limit=100`);
  return data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const { data } = await api.patch<Application>(`/${id}/status`, { status });
  return data;
};

export const updateApplication = async (id: string, updates: Partial<Application>) => {
  const { data } = await api.put<Application>(`/${id}`, updates);
  return data;
};

export const getApplicationActivities = async (id: string) => {
  const { data } = await api.get<ActivityLog[]>(`/${id}/activities`);
  return data;
};
