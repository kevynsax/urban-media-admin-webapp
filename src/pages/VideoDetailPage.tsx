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
import { fetchLinks } from '../store/linkSlice';
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

  const { links, isLoading: linksLoading } = useSelector(
    (state: RootState) => state.link
  );

  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    video?.publishStatus || 'unpublished'
  );
  const [linkToAction, setLinkToAction] = useState(video?.linkToAction || '');
  const [showLinkAt, setShowLinkAt] = useState(video?.showLinkAt || 0);
  const [qrCodeX, setQrCodeX] = useState(video?.qrCodeX || 0.15);
  const [qrCodeY, setQrCodeY] = useState(video?.qrCodeY || 0.15);
  const [qrCodeSize, setQrCodeSize] = useState(video?.qrCodeSize || 0.15);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLinks());
  }, [dispatch]);

  useEffect(() => {
    if (video) {
      setPublishStatus(video.publishStatus);
      setLinkToAction(video.linkToAction);
      setShowLinkAt(video.showLinkAt || 0);
      setQrCodeX(video.qrCodeX || 0.15);
      setQrCodeY(video.qrCodeY || 0.15);
      setQrCodeSize(video.qrCodeSize || 0.15);
    }
  }, [video]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await dispatch(
        updateVideoStatus({
          id,
          data: { publishStatus, linkToAction, showLinkAt, qrCodeX, qrCodeY, qrCodeSize },
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

              {linksLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Loading links...
                  </Typography>
                </Box>
              ) : (
                <TextField
                  select
                  label="Link to Action"
                  value={linkToAction}
                  onChange={(e) => setLinkToAction(e.target.value)}
                  fullWidth
                  disabled={isUpdating}
                  helperText={links.length === 0 ? 'No links available. Create a link first.' : ''}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {links.map((link) => (
                    <MenuItem key={link.id} value={link.id}>
                      {link.targetLink} (ID: {link.id.slice(0, 8)}...)
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Show Link At (seconds)"
                type="number"
                value={showLinkAt}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  if (!isNaN(val)) setShowLinkAt(val);
                }}
                fullWidth
                helperText="Timestamp in seconds when the QR code link should be displayed"
                inputProps={{ min: 0 }}
              />

              <TextField
                label="QR Code X Position"
                type="number"
                value={qrCodeX}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0.15 : parseFloat(e.target.value);
                  if (!isNaN(val)) setQrCodeX(val);
                }}
                fullWidth
                disabled={isUpdating}
                helperText="Horizontal position (0.0 = left, 1.0 = right, default: 0.15)"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />

              <TextField
                label="QR Code Y Position"
                type="number"
                value={qrCodeY}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0.15 : parseFloat(e.target.value);
                  if (!isNaN(val)) setQrCodeY(val);
                }}
                fullWidth
                disabled={isUpdating}
                helperText="Vertical position (0.0 = top, 1.0 = bottom, default: 0.15)"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />

              <TextField
                label="QR Code Size"
                type="number"
                value={qrCodeSize}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0.15 : parseFloat(e.target.value);
                  if (!isNaN(val)) setQrCodeSize(val);
                }}
                fullWidth
                disabled={isUpdating}
                helperText="Size relative to screen width (0.0-1.0, default: 0.15)"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
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
