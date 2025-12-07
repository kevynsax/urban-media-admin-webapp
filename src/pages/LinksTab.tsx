import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import { Add, ContentCopy, Link as LinkIcon, Download, QrCode, Visibility } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import type { RootState } from '../store';
import { fetchLinks, createLink } from '../store/linkSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showAlert } from '../store/alertSlice';
import { AppConfig } from '../config/app.config';
import { apiService } from '../services/api.service';
import type { Link, LinkHit } from '../types';

const LinksTab = () => {
  const dispatch = useAppDispatch();
  const { links, isLoading } = useSelector((state: RootState) => state.link);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetLink, setTargetLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [hitsDialogOpen, setHitsDialogOpen] = useState(false);
  const [linkHits, setLinkHits] = useState<LinkHit[]>([]);
  const [loadingHits, setLoadingHits] = useState(false);
  const [hitsCache, setHitsCache] = useState<Record<string, number>>({});

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchLinks());
  }, [dispatch]);

  // Fetch hits count for all links
  useEffect(() => {
    const fetchHitsCounts = async () => {
      const counts: Record<string, number> = {};
      for (const link of links) {
        try {
          const hits = await apiService.getLinkHits(link.id);
          counts[link.id] = hits.length;
        } catch {
          counts[link.id] = 0;
        }
      }
      setHitsCache(counts);
    };

    if (links.length > 0) {
      fetchHitsCounts();
    }
  }, [links]);

  const handleCreateLink = async () => {
    if (!targetLink.trim()) {
      dispatch(
        showAlert({
          message: 'Please enter a target link',
          severity: 'warning',
        })
      );
      return;
    }

    setIsCreating(true);
    try {
      await dispatch(createLink({ targetLink })).unwrap();
      dispatch(
        showAlert({
          message: 'Link created successfully',
          severity: 'success',
        })
      );
      setDialogOpen(false);
      setTargetLink('');
    } catch (error) {
      dispatch(
        showAlert({
          message: error as string,
          severity: 'error',
        })
      );
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (linkId: string) => {
    const fullUrl = `${AppConfig.baseUrl}/links/redirect/${linkId}`;
    navigator.clipboard.writeText(fullUrl);
    dispatch(
      showAlert({
        message: 'Link copied to clipboard',
        severity: 'success',
      })
    );
  };

  const openQrDialog = (link: Link) => {
    setSelectedLink(link);
    setQrDialogOpen(true);
  };

  const downloadQrCode = useCallback(() => {
    if (!qrRef.current || !selectedLink) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `qrcode-${selectedLink.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    dispatch(
      showAlert({
        message: 'QR Code downloaded successfully',
        severity: 'success',
      })
    );
  }, [selectedLink, dispatch]);

  const openHitsDialog = async (link: Link) => {
    setSelectedLink(link);
    setHitsDialogOpen(true);
    setLoadingHits(true);
    try {
      const hits = await apiService.getLinkHits(link.id);
      setLinkHits(hits);
    } catch (error) {
      dispatch(
        showAlert({
          message: 'Failed to load link hits',
          severity: 'error',
        })
      );
      setLinkHits([]);
    } finally {
      setLoadingHits(false);
    }
  };

  const getLinkUrl = (linkId: string) => `${AppConfig.baseUrl}/links/redirect/${linkId}`;

  if (isLoading && links.length === 0) {
    return (
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
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      {links.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
          }}
        >
          <LinkIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No links yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first link to get started
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link) => (
            <Card key={link.id} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  {/* QR Code Preview */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => openQrDialog(link)}
                  >
                    <QRCodeCanvas
                      value={getLinkUrl(link.id)}
                      size={80}
                      level="M"
                    />
                  </Box>

                  {/* Link Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ID: {link.id.slice(0, 8)}...
                      </Typography>
                      <Chip
                        icon={<Visibility sx={{ fontSize: 16 }} />}
                        label={`${hitsCache[link.id] ?? '...'} hits`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => openHitsDialog(link)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Target: {link.targetLink}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    >
                      {getLinkUrl(link.id)}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Tooltip title="View QR Code">
                      <IconButton
                        onClick={() => openQrDialog(link)}
                        color="primary"
                        size="small"
                      >
                        <QrCode />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy link URL">
                      <IconButton
                        onClick={() => copyToClipboard(link.id)}
                        color="primary"
                        size="small"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Link Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !isCreating && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Target Link URL"
            type="url"
            fullWidth
            value={targetLink}
            onChange={(e) => setTargetLink(e.target.value)}
            placeholder="https://example.com"
            disabled={isCreating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateLink}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {selectedLink && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 2,
              }}
            >
              <Box ref={qrRef} sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
                <QRCodeCanvas
                  value={getLinkUrl(selectedLink.id)}
                  size={256}
                  level="H"
                  includeMargin
                />
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                {getLinkUrl(selectedLink.id)}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Target: {selectedLink.targetLink}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button
            onClick={downloadQrCode}
            variant="contained"
            startIcon={<Download />}
          >
            Download QR Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Hits Dialog */}
      <Dialog
        open={hitsDialogOpen}
        onClose={() => setHitsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Link Hits {selectedLink && `(${linkHits.length} total)`}
        </DialogTitle>
        <DialogContent>
          {loadingHits ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : linkHits.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">No hits recorded yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {linkHits.map((hit) => (
                <Card key={hit.id} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          IP: {hit.ipAddress}
                        </Typography>
                        {hit.address && (
                          <Typography variant="body2">
                            📍 {[hit.address.city, hit.address.region, hit.address.country]
                              .filter(Boolean)
                              .join(', ')}
                          </Typography>
                        )}
                      </Box>
                      {hit.geoLocation && hit.geoLocation.latitude !== 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Lat: {hit.geoLocation.latitude.toFixed(4)}, Lng: {hit.geoLocation.longitude.toFixed(4)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHitsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LinksTab;

