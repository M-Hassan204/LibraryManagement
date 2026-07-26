import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Avatar,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/utils/canvasUtils';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/imageUrl';
import type { UserDto } from '@/types/user.types';

interface ProfileImageUploaderProps {
  profile: UserDto;
}

export default function ProfileImageUploader({ profile }: ProfileImageUploaderProps): React.ReactElement {
  const { updateUser } = useAuth();
  const { 
    uploadProfileImage, 
    isUploadingProfileImage,
    removeProfileImage,
    isRemovingProfileImage
  } = useProfile();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert("Unsupported file format. Please upload JPG, PNG, or WEBP.");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleMenuClose();
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageFile) {
        const result = await uploadProfileImage(croppedImageFile);
        if (result.success && result.data) {
          updateUser({ profileImageUrl: result.data.profileImageUrl });
        }
      }
    } catch (e) {
      console.error(e);
      alert('Failed to crop and upload image.');
    } finally {
      setIsCropping(false);
      setImageSrc(null);
    }
  };

  const handleRemoveImage = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        const result = await removeProfileImage();
        if (result.success && result.data) {
          updateUser({ profileImageUrl: undefined });
        }
      } catch (e) {
        console.error(e);
        alert('Failed to remove image.');
      }
    }
    handleMenuClose();
  };

  const hasAvatar = !!profile.profileImageUrl;
  const avatarUrl = hasAvatar ? getImageUrl(profile.profileImageUrl) : undefined;
  const isLoading = isUploadingProfileImage || isRemovingProfileImage;

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <IconButton
            onClick={handleMenuClick}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' },
              width: 32,
              height: 32
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={16} /> : <PhotoCameraIcon fontSize="small" color="primary" />}
          </IconButton>
        }
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            boxShadow: 1
          }}
        >
          {profile.firstName?.[0]?.toUpperCase() || 'U'}
          {profile.lastName?.[0]?.toUpperCase() || ''}
        </Avatar>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => fileInputRef.current?.click()}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload a photo...</ListItemText>
        </MenuItem>
        {hasAvatar && (
          <MenuItem onClick={handleRemoveImage}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Remove photo</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={isCropping} onClose={() => setIsCropping(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crop Profile Picture</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: 400, position: 'relative' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ px: 2, mb: 2 }}>
            <Typography variant="overline" color="text.secondary">Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(_e, zoom) => setZoom(Number(zoom))}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsCropping(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSaveCrop} variant="contained" color="primary" disabled={isUploadingProfileImage}>
              {isUploadingProfileImage ? 'Saving...' : 'Save Picture'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
