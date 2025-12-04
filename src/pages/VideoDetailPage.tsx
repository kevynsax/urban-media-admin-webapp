import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Delete, ContentCopy } from '@mui/icons-material';
import type { RootState } from '../store';
import {
  updateVideoStatus,
  deleteVideo,
} from '../store/videoSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showAlert } from '../store/alertSlice';
import type { PublishStatus } from '../types';

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'internal_only', label: 'Internal Only' },
  { value: 'unpublished', label: 'Unpublished' },
];

const VideoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const video = useSelector((state: RootState) =>
    state.video.videos.find((v) => v.id === id)
  );

  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    video?.publishStatus || 'unpublished'
  );
  const [linkToAction, setLinkToAction] = useState(video?.linkToAction || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (video) {
      setPublishStatus(video.publishStatus);
      setLinkToAction(video.linkToAction);
    }
  }, [video]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await dispatch(
        updateVideoStatus({
          id,
          data: { publishStatus, linkToAction },
        })
      ).unwrap();
      dispatch(
        showAlert({ message: 'Video updated successfully', severity: 'success' })
      );
    } catch (error) {
      dispatch(
        showAlert({
          message: error as string,
          severity: 'error',
        })
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await dispatch(deleteVideo(id)).unwrap();
      dispatch(
        showAlert({ message: 'Video deleted successfully', severity: 'success' })
      );
      navigate('/videos');
    } catch (error) {
      dispatch(
        showAlert({
          message: error as string,
          severity: 'error',
        })
      );
    }
    setDeleteDialogOpen(false);
  };

  const handleCopyUrl = () => {
    if (video?.videoUrl) {
      navigator.clipboard.writeText(video.videoUrl);
      dispatch(
        showAlert({ message: 'URL copied to clipboard', severity: 'success' })
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!video) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/videos')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Video Details
          </Typography>
          <IconButton color="inherit" onClick={() => setDeleteDialogOpen(true)}>
            <Delete />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Video Player
            </Typography>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%',
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <video
                controls
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                src={video.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  File Name
                </Typography>
                <Typography variant="body1">{video.fileName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(video.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">
                  {formatDate(video.updatedAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Video URL
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {video.videoUrl}
                  </Typography>
                  <IconButton size="small" onClick={handleCopyUrl}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Edit Video
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Publish Status"
                value={publishStatus}
                onChange={(e) => setPublishStatus(e.target.value as PublishStatus)}
                fullWidth
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Link to Action"
                value={linkToAction}
                onChange={(e) => setLinkToAction(e.target.value)}
                fullWidth
                placeholder="https://example.com"
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={24} /> : 'Update Video'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this video? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoDetailPage;
