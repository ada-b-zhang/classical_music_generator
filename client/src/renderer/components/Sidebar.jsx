import React from 'react';

const Sidebar = () => (
  <div style={{
    position: 'fixed',
    left: 0,
    top: '20%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    zIndex: 1000
  }}>
    <button title="History" style={iconBtnStyle}>📋</button>
    <button title="Prompts" style={iconBtnStyle}>📚</button>
    <button title="Users" style={iconBtnStyle}>👥</button>
    <button title="Interface Configuration" style={iconBtnStyle}>⚙️</button>
    <button title="Add" style={iconBtnStyle}>➕</button>
  </div>
);

const iconBtnStyle = {
  background: '#222',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: 40,
  height: 40,
  fontSize: 20,
  margin: '0 auto',
  cursor: 'pointer'
};

export default Sidebar; 