import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalState {
  messages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  snackbar: { open: boolean; message: string; type: string };
  setSnackbar: React.Dispatch<React.SetStateAction<{ open: boolean; message: string; type: string }>>;
  agentCards: any[];
  setAgentCards: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultState: GlobalState = {
  messages: [],
  setMessages: () => {},
  input: '',
  setInput: () => {},
  snackbar: { open: false, message: '', type: '' },
  setSnackbar: () => {},
  agentCards: [],
  setAgentCards: () => {},
};

const GlobalStateContext = createContext<GlobalState>(defaultState);

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: string }>({ open: false, message: '', type: '' });
  const [agentCards, setAgentCards] = useState<any[]>([]);

  return (
    <GlobalStateContext.Provider value={{
      messages, setMessages,
      input, setInput,
      snackbar, setSnackbar,
      agentCards, setAgentCards
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext); 