import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-start' : 'flex-end',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          background: isUser ? '#181818' : '#222',
          color: 'white',
          border: `2px solid ${isUser ? '#1976d2' : '#00e676'}`,
          borderRadius: 8,
          padding: 16,
          minWidth: 200,
          maxWidth: 600,
          width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span style={{ marginRight: 12 }}>
          {isUser ? (
            <span role="img" aria-label="user">👤</span>
          ) : (
            <span role="img" aria-label="assistant">🤖</span>
          )}
        </span>
        <span>{message.content}</span>
      </div>
    </div>
  );
};

export default ChatMessage; 