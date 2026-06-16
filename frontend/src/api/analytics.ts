import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api/analytics',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnalyticsData {
  kpis: {
    totalApplications: number;
    activeApplications: number;
    interviewsScheduled: number;
    interviewsCompleted: number;
    offersReceived: number;
    applicationsRejected: number;
    successRate: number;
    interviewConversionRate: number;
  };
  funnel: Array<{ stage: string; value: number }>;
  sources: Array<{ source: string; total: number; interviews: number; offers: number }>;
  monthly: Array<{ month: string; applications: number; interviews: number; offers: number }>;
  priority: Array<{ priority: string; total: number; interviews: number; offers: number }>;
  health: Array<{ name: string; value: number }>;
  insights: string[];
}

export const getAnalytics = async () => {
  const { data } = await api.get<AnalyticsData>('/');
  return data;
};
