import React from 'react';
import AgentCard from './AgentCard';
import { useGlobalState } from './GlobalStateContext';

const AgentBoard = () => {
  const { agentCards } = useGlobalState();
  return (
    <div className="agent-board" style={{ position: 'fixed', right: 20, bottom: 300, background: '#222', color: 'white', padding: 16, borderRadius: 8, zIndex: 1000 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Agent Board</div>
      {agentCards.length === 0 && <div>No agent cards yet.</div>}
      {agentCards.map((card, idx) => (
        <AgentCard key={idx} card={card} />
      ))}
    </div>
  );
};

export default AgentBoard; 