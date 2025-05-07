import React from 'react';
import { GlobalStateProvider } from './GlobalStateContext';
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

const AppShell = () => (
  <div style={{ background: '#121212', minHeight: '100vh', paddingLeft: 60 }}>
    <Header />
    <Sidebar />
    <div style={{ marginTop: 60 }}>
      <MainContent />
    </div>
    <InputArea />
    <LoadingSpinner />
    <ChatBot />
    <Snackbar />
    <Toolbox />
    <HistoryDialog />
    <PromptsDialog />
    <ResourcesDialog />
    <AgentBoard />
  </div>
);

const App = () => (
  <GlobalStateProvider>
    <AppShell />
  </GlobalStateProvider>
);

export default App; 