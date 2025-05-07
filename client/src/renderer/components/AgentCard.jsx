import React from 'react';

const AgentCard = ({ card }) => (
  <div className="agent-card" style={{ background: '#333', color: 'white', padding: 12, borderRadius: 6, marginBottom: 8 }}>
    <div style={{ fontWeight: 'bold' }}>{card && card.title}</div>
    <div>{card && card.description}</div>
  </div>
);

export default AgentCard; 