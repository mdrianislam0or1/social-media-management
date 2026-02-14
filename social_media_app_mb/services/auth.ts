import { AuthResponse } from '@/types';
import { API_ENDPOINTS } from '../constants/config';
import { api } from './api';
import { clearStorage, saveAuthToken, saveUserData } from './storage';

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);

    if (response.data.success && response.data.data.token) {
      await saveAuthToken(response.data.data.token);
      await saveUserData(response.data.data.user);
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await clearStorage();
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};
