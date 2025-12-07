export interface User {
  id: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type PublishStatus = 'published' | 'internal_only' | 'unpublished';

export interface Link {
  id: string;
  targetLink: string;
}

export interface Address {
  city: string;
  country: string;
  postal: string;
  region: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface LinkHit {
  id: string;
  videoId: string;
  ipAddress: string;
  address: Address;
  geoLocation: GeoLocation;
}

export interface CreateLinkRequest {
  targetLink: string;
}

export interface Video {
  id: string;
  fileName: string;
  videoUrl: string;
  linkToAction: string;
  publishStatus: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
  token: string;
}

export interface UpdateVideoStatusRequest {
  publishStatus: PublishStatus;
  linkToAction: string;
}

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}
