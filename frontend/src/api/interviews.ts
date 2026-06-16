import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Interview {
  _id: string;
  application_id: string;
  round_type: string;
  scheduled_date: string;
  notes?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  interview_mode: 'Online' | 'Onsite' | 'Phone';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  company_name?: string;
  job_title?: string;
}

export const getUpcomingInterviews = async () => {
  const { data } = await api.get<Interview[]>('/interviews/upcoming');
  return data;
};

export const getApplicationInterviews = async (applicationId: string) => {
  const { data } = await api.get<Interview[]>(`/applications/${applicationId}/interviews`);
  return data;
};

export const createInterview = async (applicationId: string, interview: Partial<Interview>) => {
  const { data } = await api.post<Interview>(`/applications/${applicationId}/interviews`, interview);
  return data;
};

export const updateInterview = async (applicationId: string, interviewId: string, updates: Partial<Interview>) => {
  const { data } = await api.put<Interview>(`/applications/${applicationId}/interviews/${interviewId}`, updates);
  return data;
};
