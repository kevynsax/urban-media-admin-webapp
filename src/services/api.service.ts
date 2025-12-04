import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { AppConfig } from '../config/app.config';
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  Video,
  UpdateVideoStatusRequest,
  UploadProgress,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: AppConfig.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (!error.response) {
          throw new Error('No internet connection');
        }
        throw error;
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(
        AppConfig.endpoints.login,
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Login failed');
      }
      throw error;
    }
  }

  async getVideos(): Promise<Video[]> {
    try {
      const response = await this.api.get<ApiResponse<Video[]>>(
        AppConfig.endpoints.videos
      );
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Failed to fetch videos');
      }
      throw error;
    }
  }

  async createVideo(
    videoFile: File,
    linkToAction: string,
    publishStatus: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Video> {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('linkToAction', linkToAction);
      formData.append('publishStatus', publishStatus);

      const response = await this.api.post<ApiResponse<Video>>(
        AppConfig.endpoints.videos,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress({
                percentage,
                loaded: progressEvent.loaded,
                total: progressEvent.total,
              });
            }
          },
        }
      );
      return response.data.data as Video;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Failed to upload video');
      }
      throw error;
    }
  }

  async updateVideoStatus(
    id: string,
    data: UpdateVideoStatusRequest
  ): Promise<Video> {
    try {
      const response = await this.api.put<ApiResponse<Video>>(
        AppConfig.endpoints.videoStatus(id),
        data
      );
      return response.data.data as Video;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Failed to update video');
      }
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      await this.api.delete<ApiResponse<unknown>>(
        AppConfig.endpoints.deleteVideo(id)
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Failed to delete video');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
