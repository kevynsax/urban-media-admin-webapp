import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Fab,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Logout,
  FilterList,
} from '@mui/icons-material';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { fetchVideos, clearError } from '../store/videoSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showAlert } from '../store/alertSlice';
import type { PublishStatus, Video } from '../types';

const statusColors: Record<PublishStatus, string> = {
  published: '#4caf50',
  internal_only: '#ff9800',
  unpublished: '#f44336',
};

const statusLabels: Record<PublishStatus, string> = {
  published: 'Published',
  internal_only: 'Internal Only',
  unpublished: 'Unpublished',
};

const VideosPage = () => {
  const [filterStatus, setFilterStatus] = useState<PublishStatus | 'all'>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { videos, isLoading, error } = useSelector(
    (state: RootState) => state.video
  );

  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showAlert({ message: error, severity: 'error' }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleVideoClick = (video: Video) => {
    navigate(`/videos/${video.id}`);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (status: PublishStatus | 'all') => {
    setFilterStatus(status);
    handleFilterClose();
  };

  const filteredVideos =
    filterStatus === 'all'
      ? videos
      : videos.filter((v) => v.publishStatus === filterStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Videos
          </Typography>
          <IconButton color="inherit" onClick={handleFilterClick}>
            <FilterList />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect('all')}>
          All Videos
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('published')}>
          Published
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('internal_only')}>
          Internal Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('unpublished')}>
          Unpublished
        </MenuItem>
      </Menu>

      <Box sx={{ p: 3, pb: 10 }}>
        {filterStatus !== 'all' && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`Filter: ${statusLabels[filterStatus]}`}
              onDelete={() => setFilterStatus('all')}
              color="primary"
            />
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading && filteredVideos.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No videos found
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              sx={{
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea onClick={() => handleVideoClick(video)}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {video.fileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(video.createdAt)}
                  </Typography>
                  <Chip
                    label={statusLabels[video.publishStatus]}
                    size="small"
                    sx={{
                      bgcolor: statusColors[video.publishStatus],
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/videos/new')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default VideosPage;
