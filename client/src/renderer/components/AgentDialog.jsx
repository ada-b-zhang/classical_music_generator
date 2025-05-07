import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useStore } from '../store';

const AgentDialog = () => {
  const {
    configAgent,
    setConfigAgent,
    agents,
    addAgent,
    deleteAgent,
    selectAgent,
    currentAgent
  } = useStore();

  const [newAgent, setNewAgent] = React.useState({
    name: '',
    description: '',
    systemPrompt: ''
  });

  const handleClose = () => {
    setConfigAgent(false);
  };

  const handleAddAgent = () => {
    if (newAgent.name && newAgent.systemPrompt) {
      addAgent(newAgent);
      setNewAgent({
        name: '',
        description: '',
        systemPrompt: ''
      });
    }
  };

  const handleSelectAgent = (agent) => {
    selectAgent(agent);
    handleClose();
  };

  return (
    <Dialog
      open={configAgent}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Agent Settings
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Delete />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Agent
          </Typography>
          <TextField
            fullWidth
            label="Agent Name"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newAgent.description}
            onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="System Prompt"
            value={newAgent.systemPrompt}
            onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddAgent}
            sx={{ mt: 2 }}
          >
            Add Agent
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Available Agents
        </Typography>
        <List>
          {agents.map((agent) => (
            <ListItem
              key={agent.name}
              button
              onClick={() => handleSelectAgent(agent)}
              selected={currentAgent?.name === agent.name}
            >
              <ListItemText
                primary={agent.name}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {agent.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      System Prompt: {agent.systemPrompt}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => deleteAgent(agent.name)}
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

export default AgentDialog; 