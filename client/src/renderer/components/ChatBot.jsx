import React from 'react';
import ChatMessage from './ChatMessage';
import { useGlobalState } from './GlobalStateContext';

const ChatBot = () => {
  const { messages } = useGlobalState();
  return (
    <div className="chat-bot">
      {messages.length === 0 && <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No messages yet.</div>}
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
    </div>
  );
};

export default ChatBot; 