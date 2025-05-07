import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import InputArea from './InputArea';
import LoadingSpinner from './LoadingSpinner';
import ChatBot from './ChatBot';
import Snackbar from './Snackbar';
import Toolbox from './Toolbox';
import HistoryDialog from './HistoryDialog';
import PromptsDialog from './PromptsDialog';
import ResourcesDialog from './ResourcesDialog';
import AgentBoard from './AgentBoard';

const AppShell: React.FC = () => (
  <div style={{ background: '#121212', minHeight: '100vh', paddingLeft: 60 }}>
    <Header />
    <Sidebar />
    <InputArea />
    <ChatBot />
    <Snackbar />
    <Toolbox />
    <HistoryDialog />
    <PromptsDialog />
    <ResourcesDialog />
    <AgentBoard />
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
      setFade(true); // Start fade animation after loading
    }, 1000); // Load for 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    loading ? (
      <LoadingSpinner />
    ) : (
      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.75s ease-in-out' }}>
        <AppShell />
      </div>
    )
  );
};

export default App; 