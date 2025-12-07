import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, CloudUpload, VideoFile } from '@mui/icons-material';
import type { RootState } from '../store';
import { createVideo } from '../store/videoSlice';
import { fetchLinks } from '../store/linkSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showAlert } from '../store/alertSlice';
import type { PublishStatus } from '../types';

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'internal_only', label: 'Internal Only' },
  { value: 'unpublished', label: 'Unpublished' },
];

const VideoUploadPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, uploadProgress } = useSelector(
    (state: RootState) => state.video
  );
  const { links, isLoading: linksLoading } = useSelector(
    (state: RootState) => state.link
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [publishStatus, setPublishStatus] =
    useState<PublishStatus>('unpublished');
  const [showLinkAt, setShowLinkAt] = useState(0);

  useEffect(() => {
    dispatch(fetchLinks());
  }, [dispatch]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        dispatch(
          showAlert({
            message: 'Please select a valid video file',
            severity: 'error',
          })
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      dispatch(
        showAlert({
          message: 'Please select a video file',
          severity: 'warning',
        })
      );
      return;
    }

    try {
      await dispatch(
        createVideo({
          videoFile: selectedFile,
          linkToAction: selectedLinkId,
          publishStatus,
          showLinkAt,
        })
      ).unwrap();
      dispatch(
        showAlert({
          message: 'Video uploaded successfully',
          severity: 'success',
        })
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
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/videos')}
            disabled={isLoading}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Upload Video
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                disabled={isLoading}
              />

              {!selectedFile ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#fafafa',
                    border: '2px dashed #ccc',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                      borderColor: '#999',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload
                    sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Choose Video File
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to browse or drag and drop
                  </Typography>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: '#e3f2fd',
                    border: '1px solid #2196f3',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <VideoFile sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                    </Box>
                    {!isLoading && (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Change
                      </Button>
                    )}
                  </Box>
                </Paper>
              )}

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
                  value={selectedLinkId}
                  onChange={(e) => setSelectedLinkId(e.target.value)}
                  fullWidth
                  disabled={isLoading}
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
                select
                label="Publish Status"
                value={publishStatus}
                onChange={(e) =>
                  setPublishStatus(e.target.value as PublishStatus)
                }
                fullWidth
                disabled={isLoading}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Show Link At (seconds)"
                type="number"
                value={showLinkAt}
                onChange={(e) => setShowLinkAt(parseInt(e.target.value) || 0)}
                fullWidth
                disabled={isLoading}
                helperText="Timestamp in seconds when the QR code link should be displayed"
                inputProps={{ min: 0 }}
              />

              {isLoading && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Uploading...</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {uploadProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
                startIcon={<CloudUpload />}
              >
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default VideoUploadPage;
