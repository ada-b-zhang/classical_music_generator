import React from 'react';
import { Snackbar as MuiSnackbar, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const Snackbar = ({ open, message, type, onClose }) => {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={type}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar; 