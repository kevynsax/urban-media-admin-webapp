import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api.service';
import type {
    Video,
    UpdateVideoStatusRequest,
} from '../types';
import type { CreateVideoDto } from '../types/createVideoDto.ts';

interface VideoState {
    videos: Video[];
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
}

const initialState: VideoState = {
    videos: [],
    isLoading: false,
    error: null,
    uploadProgress: 0,
};

export const fetchVideos = createAsyncThunk(
    'video/fetchVideos',
    async (_, { rejectWithValue }) => {
        try {
            const videos = await apiService.getVideos();
            return videos;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch videos'
            );
        }
    }
);

export const createVideo = createAsyncThunk(
    'video/createVideo',
    async (
        dto: CreateVideoDto,
        { rejectWithValue, dispatch }
    ) => {
        try {
            const video = await apiService.createVideo(dto, x => {
                dispatch(setUploadProgress(x.percentage));
            });

            dispatch(setUploadProgress(0));
            return video;
        } catch (error) {
            dispatch(setUploadProgress(0));
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to upload video'
            );
        }
    }
);

export const updateVideoStatus = createAsyncThunk(
    'video/updateVideoStatus',
    async (
        { id, data }: { id: string; data: UpdateVideoStatusRequest },
        { rejectWithValue }
    ) => {
        try {
            const video = await apiService.updateVideoStatus(id, data);
            return video;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update video'
            );
        }
    }
);

export const deleteVideo = createAsyncThunk(
    'video/deleteVideo',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiService.deleteVideo(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to delete video'
            );
        }
    }
);

const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUploadProgress: (state, action: PayloadAction<number>) => {
            state.uploadProgress = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch videos
            .addCase(fetchVideos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVideos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.videos = action.payload;
            })
            .addCase(fetchVideos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create video
            .addCase(createVideo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createVideo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.videos.unshift(action.payload);
            })
            .addCase(createVideo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update video
            .addCase(updateVideoStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateVideoStatus.fulfilled, (state, action) => {
                const index = state.videos.findIndex((v) => v.id === action.payload.id);
                if (index !== -1) {
                    state.videos[index] = action.payload;
                }
            })
            .addCase(updateVideoStatus.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Delete video
            .addCase(deleteVideo.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteVideo.fulfilled, (state, action) => {
                state.videos = state.videos.filter((v) => v.id !== action.payload);
            })
            .addCase(deleteVideo.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setUploadProgress } = videoSlice.actions;
export default videoSlice.reducer;
