import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useStore } from '../store';

const HistoryDialog = () => {
  const {
    configHistory,
    setConfigHistory,
    history,
    deleteHistory,
    selectHistory,
    downloadHistory,
    downloadAllHistory
  } = useStore();

  return (
    <Dialog
      open={configHistory}
      onClose={() => setConfigHistory(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Chat History</Typography>
        <Box>
          <IconButton onClick={downloadAllHistory} color="primary">
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={() => setConfigHistory(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {history.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No chat history yet.
          </Typography>
        ) : (
          <List>
            {history.map((item, index) => (
              <ListItem
                key={item.id}
                button
                onClick={() => {
                  selectHistory(index);
                  setConfigHistory(false);
                }}
                divider
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' } 
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {Array.isArray(item.history[0]?.content) 
                        ? item.history[0]?.content[1]?.text || "Text message" 
                        : item.history[0]?.content || "NA"}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {Array.isArray(item.history[item.history.length - 1]?.content)
                        ? item.history[item.history.length - 1]?.content[1]?.text || "Response" 
                        : item.history[item.history.length - 1]?.content || "NA"}
                    </Typography>
                  }
                />
                <Box>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadHistory(index);
                    }}
                    size="small"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistory(index);
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;