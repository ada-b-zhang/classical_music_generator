import React from 'react';
import { useGlobalState } from './GlobalStateContext';

const InputArea = () => {
  const { input, setInput, messages, setMessages, setSnackbar } = useGlobalState();

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { content: input, role: 'user' }]);
    setInput('');
    setSnackbar({ open: true, message: 'Message sent!', type: 'success' });
  };

  return (
    <div className="input-area" style={{ display: 'flex', padding: 16, background: '#1E1E1E', position: 'fixed', bottom: 0, width: '100%' }}>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder="Type your message..."
        style={{ flex: 1, marginRight: 8, background: '#2D2D2D', color: 'white', border: 'none', borderRadius: 4, padding: 8 }}
        rows={2}
      />
      <button onClick={handleSend} style={{ background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px' }}>
        Send
      </button>
    </div>
  );
};

export default InputArea; 