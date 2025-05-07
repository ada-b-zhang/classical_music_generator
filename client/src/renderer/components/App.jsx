import React, { useEffect } from 'react';
import { Box, Container, ThemeProvider, createTheme } from '@mui/material';
import ChatBox from './components/ChatBox';
import InputArea from './components/InputArea';
import HistoryDialog from './components/HistoryDialog';
import SettingsDialog from './components/SettingsDialog';
import ResourcesDialog from './components/ResourcesDialog';
import AgentDialog from './components/AgentDialog';
import CustomSnackbar from './components/CustomSnackbar';
import { useStore } from './store';

// Theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    teal: {
      main: '#009688',
    },
    brown: {
      main: '#795548',
    },
  },
});

const App = () => {
  const {
    messages,
    setMessages,
    isGenerating,
    createCompletion,
    addToHistory,
    snackbar
  } = useStore();

  // Effect for handling message changes
  useEffect(() => {
    console.log(messages)
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      createCompletion(messages);
    }
  }, [messages, createCompletion]);

  // Effect for updating history when assistant responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      addToHistory(messages);
    }
  }, [messages, addToHistory]);

  const handleCopy = (message) => {
    const textToCopy = Array.isArray(message.content)
      ? message.content.map(item => item.text).join('\n')
      : message.content;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDelete = (index) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleReduce = (index) => {
    setMessages(messages.slice(index));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            pb: 20, 
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.length > 0 && (
            <ChatBox
              messages={messages}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onReduce={handleReduce}
            />
          )}
        </Container>

        <InputArea />
        
        {/* Dialogs */}
        <HistoryDialog />
        <SettingsDialog />
        <ResourcesDialog />
        <AgentDialog />
        
        {/* Snackbar for notifications */}
        <CustomSnackbar 
          open={snackbar.open} 
          message={snackbar.message} 
          type={snackbar.type} 
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;