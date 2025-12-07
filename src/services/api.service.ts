import axios, { AxiosError, type AxiosProgressEvent, type AxiosRequestConfig } from 'axios';
import type { AxiosInstance } from 'axios';
import { AppConfig } from '../config/app.config';
import type {
    LoginRequest,
    LoginResponse,
    ApiResponse,
    Video,
    UpdateVideoStatusRequest,
    UploadProgress,
    Link,
    CreateLinkRequest,
    LinkHit,
} from '../types';
import type { CreateVideoDto } from '../types/createVideoDto.ts';

type OnProgress = (progress: UploadProgress) => void;

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

        this.api.interceptors.request.use(
            (config) => {
                if (!this.token)
                    return config;

                config.headers.Authorization = `Bearer ${this.token}`;
                return config;
            },
            (error) => Promise.reject(error)
        );

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

    public login = async (credentials: LoginRequest): Promise<LoginResponse> =>
        this.api.post<LoginResponse>('/login', credentials)
            .then(response => response.data)
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Login failed');
                }
                throw err;
            })

    public getVideos = async (): Promise<Video[]> =>
        this.api.get<ApiResponse<Video[]>>('/videos')
            .then(response => response.data.data || [])
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to fetch videos');
                }
                throw err;
            })

    public createVideo = async (dto: CreateVideoDto, onProgress: OnProgress): Promise<Video> => {
        try {
            const formData = new FormData();
            formData.append('video', dto.videoFile);
            formData.append('linkToAction', dto.linkToAction);
            formData.append('publishStatus', dto.publishStatus);
            formData.append('showLinkAt', dto.showLinkAt.toString());
            formData.append('fileName', dto.videoFile.name)

            const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                if (!onProgress || !progressEvent.total)
                    return;

                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress({
                    percentage,
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                });
            }
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress
            };

            const response = await this.api.post<ApiResponse<Video>>('/videos', formData, config);
            return response.data.data as Video;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data) {
                const apiError = error.response.data as ApiResponse<unknown>;
                throw new Error(apiError.message || 'Failed to upload video');
            }
            throw error;
        }
    }

    public updateVideoStatus = (id: string, data: UpdateVideoStatusRequest): Promise<Video> =>
        this.api.put<ApiResponse<Video>>(`/videos/status/${id}`, data)
            .then(x => x.data.data as Video)
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to update video');
                }
                throw err;
            })

    public deleteVideo = async (id: string): Promise<void> =>
        this.api.delete<ApiResponse<unknown>>(`/videos/${id}`)
            .then(() => {})
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to delete video');
                }
                throw err;
            })

    public getLinks = async (): Promise<Link[]> =>
        this.api.get<ApiResponse<Link[]>>('/links')
            .then(response => response.data.data || [])
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to fetch links');
                }
                throw err;
            })

    public createLink = async (data: CreateLinkRequest): Promise<Link> =>
        this.api.post<ApiResponse<Link>>('/links', data)
            .then(response => response.data.data as Link)
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to create link');
                }
                throw err;
            })

    public getLinkHits = async (linkId: string): Promise<LinkHit[]> =>
        this.api.get<ApiResponse<LinkHit[]>>(`/links/${linkId}/hits`)
            .then(response => response.data.data || [])
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.data) {
                    const apiError = err.response.data as ApiResponse<unknown>;
                    throw new Error(apiError.message || 'Failed to fetch link hits');
                }
                throw err;
            })
}

export const apiService = new ApiService();
