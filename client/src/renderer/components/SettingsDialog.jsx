import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon, 
  Refresh as RefreshIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useStore } from '../store';

const SettingsDialog = () => {
  const {
    configDialog,
    setConfigDialog,
    apiKey,
    setApiKey,
    apiKeyShow,
    setApiKeyShow,
    url,
    setUrl,
    path,
    setPath,
    model,
    setModel,
    authPrefix,
    setAuthPrefix,
    contentType,
    setContentType,
    maxTokensType,
    setMaxTokensType,
    maxTokensValue,
    setMaxTokensValue,
    temperature,
    setTemperature,
    topP,
    setTopP,
    method,
    setMethod,
    stream,
    setStream,
    mcp,
    setMcp,
    resetState
  } = useStore();

  const handleClose = () => {
    setConfigDialog(false);
  };

  const handleReset = () => {
    resetState();
  };

  return (
    <Dialog
      open={configDialog}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Settings</Typography>
        <Box>
          <IconButton onClick={handleReset} color="error">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="API Key"
            type={apiKeyShow ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setApiKeyShow(!apiKeyShow)}
                  edge="end"
                >
                  {apiKeyShow ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Endpoint
            </Typography>
          </Divider>

          <TextField
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <TextField
            label="Path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />

          <TextField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Advanced
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="HTTP Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                />
              }
              label="Stream"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={mcp}
                  onChange={(e) => setMcp(e.target.checked)}
                />
              }
              label="MCP"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Max Tokens Prefix"
              value={maxTokensType}
              onChange={(e) => setMaxTokensType(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Tokens Value"
              type="number"
              value={maxTokensValue}
              onChange={(e) => setMaxTokensValue(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Top P"
              type="number"
              value={topP}
              onChange={(e) => setTopP(e.target.value)}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Content Type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />

          <TextField
            label="Auth Prefix"
            value={authPrefix}
            onChange={(e) => setAuthPrefix(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="error">
          Reset
        </Button>
        <Button onClick={handleClose} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;