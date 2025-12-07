import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api.service';
import type { Link, CreateLinkRequest } from '../types';

interface LinkState {
    links: Link[];
    isLoading: boolean;
    error: string | null;
}

const initialState: LinkState = {
    links: [],
    isLoading: false,
    error: null,
};

export const fetchLinks = createAsyncThunk(
    'link/fetchLinks',
    async (_, { rejectWithValue }) => {
        try {
            const links = await apiService.getLinks();
            return links;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch links'
            );
        }
    }
);

export const createLink = createAsyncThunk(
    'link/createLink',
    async (data: CreateLinkRequest, { rejectWithValue }) => {
        try {
            const link = await apiService.createLink(data);
            return link;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create link'
            );
        }
    }
);

const linkSlice = createSlice({
    name: 'link',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch links
            .addCase(fetchLinks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLinks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.links = action.payload;
            })
            .addCase(fetchLinks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create link
            .addCase(createLink.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createLink.fulfilled, (state, action) => {
                state.isLoading = false;
                state.links.unshift(action.payload);
            })
            .addCase(createLink.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = linkSlice.actions;
export default linkSlice.reducer;

