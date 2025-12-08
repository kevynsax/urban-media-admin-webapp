import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Slider } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodePositionHelperProps {
  qrCodeX: number;
  qrCodeY: number;
  qrCodeSize: number;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (size: number) => void;
  linkUrl?: string;
  videoUrl?: string;
  showLinkAt: number;
}

const QRCodePositionHelper = ({
  qrCodeX,
  qrCodeY,
  qrCodeSize,
  onPositionChange,
  onSizeChange,
  linkUrl = 'https://example.com',
  videoUrl,
  showLinkAt,
}: QRCodePositionHelperProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const qrCodeRect = e.currentTarget.getBoundingClientRect();

    // Calculate where within the QR code the user clicked (as a fraction of container size)
    const offsetX = (e.clientX - qrCodeRect.left) / rect.width;
    const offsetY = (e.clientY - qrCodeRect.top) / rect.height;

    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const aspectRatio = 9 / 16; // 0.5625 for 16:9

    // Calculate mouse position relative to container
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    // Subtract the drag offset to get the top-left corner position
    const screenX = mouseX - dragOffsetRef.current.x;
    const screenY = mouseY - dragOffsetRef.current.y;

    // Convert screen position to qrCodeX/Y values using Flutter's formula:
    // For X: screenX = (1 - qrCodeSize) * qrCodeX, so qrCodeX = screenX / (1 - qrCodeSize)
    // For Y: screenY = ((aspectRatio - qrCodeSize) / aspectRatio) * qrCodeY
    //        so qrCodeY = screenY * aspectRatio / (aspectRatio - qrCodeSize)
    const availableXFraction = 1 - qrCodeSize;
    const availableYFraction = (aspectRatio - qrCodeSize) / aspectRatio;

    // Avoid division by zero
    if (availableXFraction <= 0 || availableYFraction <= 0) return;

    const x = screenX / availableXFraction;
    const y = screenY / availableYFraction;

    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    onPositionChange(
      Math.round(clampedX * 100) / 100,
      Math.round(clampedY * 100) / 100
    );
  }, [qrCodeSize, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Seek video to the timestamp where QR code appears
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        // Ensure showLinkAt doesn't exceed video duration
        video.currentTime = Math.min(showLinkAt, video.duration);
      };

      // If metadata is already loaded
      if (video.readyState >= 1) {
        video.currentTime = Math.min(showLinkAt, video.duration);
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoUrl, showLinkAt]);

  const qrCodePixelSize = containerSize.width * qrCodeSize;

  // 16:9 aspect ratio
  const aspectRatio = 9 / 16; // 0.5625

  // In Flutter, qrSize = width * qrCodeSize (square QR code based on width)
  // Available horizontal space (as fraction of width) = (width - qrSize) / width = 1 - qrCodeSize
  // Available vertical space (as fraction of height) = (height - qrSize) / height
  //   = (width * aspectRatio - width * qrCodeSize) / (width * aspectRatio)
  //   = (aspectRatio - qrCodeSize) / aspectRatio
  const availableXFraction = 1 - qrCodeSize;
  const availableYFraction = (aspectRatio - qrCodeSize) / aspectRatio;

  // QR code size as percentage of container width
  const qrWidthPercent = qrCodeSize * 100;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        QR Code Position & Size Preview
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        {videoUrl
          ? `Preview shows video at ${showLinkAt}s (when QR code appears). Drag the QR code to position it or use the slider to adjust size.`
          : 'Drag the QR code to position it or use the slider to adjust size'}
      </Typography>

      <Paper
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio (standard video)
          bgcolor: '#1a1a1a',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
          cursor: isDragging ? 'grabbing' : 'default',
          border: '2px solid #333',
        }}
      >
        {/* Device screen representation */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
              muted
              playsInline
            />
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.3)',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              Video Content<br />
              (Full Screen)
            </Typography>
          )}
        </Box>

        {/* QR Code */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            // Match Flutter app positioning:
            // left = (width - qrSize) * qrCodeX = availableXFraction * qrCodeX * 100%
            // top = (height - qrSize) * qrCodeY = availableYFraction * qrCodeY * 100%
            left: `${availableXFraction * qrCodeX * 100}%`,
            top: `${availableYFraction * qrCodeY * 100}%`,
            width: `${qrWidthPercent}%`,
            // QR code is square - use aspect-ratio to maintain square shape
            aspectRatio: '1 / 1',
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
            transition: isDragging ? 'none' : 'all 0.2s ease',
            // Match Flutter app styling: white background with rounded corners and padding
            bgcolor: 'white',
            borderRadius: '12px',
            padding: '8px',
            boxSizing: 'border-box',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          <QRCodeCanvas
            value={linkUrl}
            size={Math.max(64, qrCodePixelSize - 16)} // Subtract padding
            level="M" // Match Flutter app's QrErrorCorrectLevel.M
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>

        {/* Grid overlay to help with positioning */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0.2,
          }}
        >
          {/* Horizontal lines */}
          {[0.25, 0.5, 0.75].map((pos) => (
            <Box
              key={`h-${pos}`}
              sx={{
                position: 'absolute',
                top: `${pos * 100}%`,
                left: 0,
                right: 0,
                height: '1px',
                bgcolor: 'white',
              }}
            />
          ))}
          {/* Vertical lines */}
          {[0.25, 0.5, 0.75].map((pos) => (
            <Box
              key={`v-${pos}`}
              sx={{
                position: 'absolute',
                left: `${pos * 100}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                bgcolor: 'white',
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Size slider */}
      <Box sx={{ px: 1 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          QR Code Size: {Math.round(qrCodeSize * 100)}%
        </Typography>
        <Slider
          value={qrCodeSize}
          onChange={(_, value) => onSizeChange(value as number)}
          min={0.05}
          max={0.4}
          step={0.01}
          marks={[
            { value: 0.05, label: '5%' },
            { value: 0.15, label: '15%' },
            { value: 0.25, label: '25%' },
            { value: 0.4, label: '40%' },
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
        />
      </Box>

      {/* Position info */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 2,
          justifyContent: 'space-around',
          px: 1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            X Position
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {(qrCodeX * 100).toFixed(0)}%
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Y Position
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {(qrCodeY * 100).toFixed(0)}%
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Size
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {(qrCodeSize * 100).toFixed(0)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default QRCodePositionHelper;

