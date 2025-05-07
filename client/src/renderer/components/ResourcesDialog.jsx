import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { Delete, Add, ContentCopy } from '@mui/icons-material';
import { useStore } from '../store';

const ResourcesDialog = () => {
  const {
    resourceDialog,
    setResourceDialog,
    resources = [],
    addResource,
    deleteResource,
    useResource
  } = useStore();

  const [tab, setTab] = React.useState(0);
  const [newResource, setNewResource] = React.useState({
    name: '',
    content: '',
    type: 'prompt'
  });

  const handleClose = () => {
    setResourceDialog(false);
  };

  const handleAddResource = () => {
    if (newResource.name && newResource.content) {
      addResource({
        ...newResource,
        type: tab === 0 ? 'prompt' : 'resource'
      });
      setNewResource({
        name: '',
        content: '',
        type: 'prompt'
      });
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleUse = (resource) => {
    useResource(resource);
    handleClose();
  };

  const filteredResources = (resources || []).filter(r => 
    tab === 0 ? r.type === 'prompt' : r.type === 'resource'
  );

  return (
    <Dialog
      open={resourceDialog}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Resources & Prompts
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Delete />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Prompts" />
          <Tab label="Resources" />
        </Tabs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New {tab === 0 ? 'Prompt' : 'Resource'}
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={newResource.name}
            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={newResource.content}
            onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddResource}
            sx={{ mt: 2 }}
          >
            Add {tab === 0 ? 'Prompt' : 'Resource'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Available {tab === 0 ? 'Prompts' : 'Resources'}
        </Typography>
        <List>
          {filteredResources.map((resource) => (
            <ListItem
              key={resource.name}
              button
              onClick={() => handleUse(resource)}
            >
              <ListItemText
                primary={resource.name}
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {resource.content}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(resource.content);
                  }}
                >
                  <ContentCopy />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteResource(resource.name);
                  }}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourcesDialog; 