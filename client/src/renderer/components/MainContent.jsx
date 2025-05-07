import React from 'react';
import { useGlobalState } from './GlobalStateContext';
import ChatBot from './ChatBot';

const MainContent = () => {
  const { messages } = useGlobalState();
  if (messages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        color: 'white',
        marginTop: 60
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 300 }}>Welcome to BachPropagation</h1>
        <p style={{ color: '#b3b3b3', fontSize: '1.5rem' }}>Your AI-powered classical music generator</p>
      </div>
    );
  }
  return <ChatBot />;
};

export default MainContent; 