import React, { useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon 
} from '@mui/material';
import { 
  Send as SendIcon, 
  Stop as StopIcon, 
  MoreHoriz as MoreHorizIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Api as ApiIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Storage as StorageIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useStore } from '../store';

const InputArea = () => {
  const { 
    userMessage, 
    setUserMessage, 
    base64Image, 
    setBase64Image,
    setImages,
    isGenerating, 
    sendMessage, 
    stopGeneration,
    clearChat,
    regenerateMessage,
    setConfigDialog,
    setAgentDialog,
    setResourceDialog,
    setConfigHistory,
    messages
  } = useStore();
  
  const fileInputRef = useRef(null);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize if needed
          let width = img.width;
          let height = img.height;
          const maxSize = 2048;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setBase64Image(base64);
        };
        img.src = event.target.result;
      };
      
      reader.readAsDataURL(file);
      setImages([file]);
    }
  };
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 100
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <SpeedDial
          ariaLabel="Settings"
          sx={{ position: 'absolute', bottom: 16, left: 16 }}
          icon={<SpeedDialIcon />}
          direction="up"
          FabProps={{ size: 'small' }}
        >
          <SpeedDialAction
            icon={<ApiIcon />}
            tooltipTitle="Settings"
            onClick={() => setConfigDialog(true)}
          />
          <SpeedDialAction
            icon={<SupervisorAccountIcon />}
            tooltipTitle="Agent"
            onClick={() => setAgentDialog(true)}
          />
          <SpeedDialAction
            icon={<StorageIcon />}
            tooltipTitle="Resources"
            onClick={() => setResourceDialog(true)}
          />
          <SpeedDialAction
            icon={<HistoryIcon />}
            tooltipTitle="History"
            onClick={() => setConfigHistory(true)}
          />
        </SpeedDial>
        
        <Box sx={{ ml: 7, flexGrow: 1 }}>
          <TextField
            multiline
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: base64Image ? (
                <Box 
                  component="img" 
                  src={base64Image} 
                  alt="Upload"
                  sx={{ 
                    height: 60, 
                    maxWidth: 100, 
                    mr: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setBase64Image('');
                    setImages([]);
                  }}
                />
              ) : (
                <IconButton 
                  component="label" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <ImageIcon />
                </IconButton>
              )
            }}
            rows={1}
            maxRows={5}
          />
        </Box>
        
        <Box sx={{ ml: 1 }}>
          {userMessage || base64Image ? (
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          ) : isGenerating ? (
            <IconButton color="primary" onClick={stopGeneration}>
              <StopIcon />
            </IconButton>
          ) : messages.length > 0 ? (
            <SpeedDial
              ariaLabel="Message options"
              icon={<MoreHorizIcon />}
              direction="up"
              FabProps={{ 
                size: 'medium',
                color: 'primary' 
              }}
            >
              <SpeedDialAction
                icon={<RefreshIcon />}
                tooltipTitle="Regenerate"
                onClick={regenerateMessage}
              />
              <SpeedDialAction
                icon={<AddIcon />}
                tooltipTitle="New Chat"
                onClick={clearChat}
              />
            </SpeedDial>
          ) : (
            <IconButton color="primary" disabled>
              <SendIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InputArea;