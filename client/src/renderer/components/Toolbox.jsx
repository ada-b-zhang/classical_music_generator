import React from 'react';
import { useGlobalState } from './GlobalStateContext';

const Toolbox = () => {
  const { setSnackbar } = useGlobalState();
  return (
    <div className="toolbox" style={{ position: 'fixed', right: 20, bottom: 140, zIndex: 1000 }}>
      <button
        style={{ background: '#1867C0', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}
        onClick={() => setSnackbar({ open: true, message: 'Toolbox button clicked!', type: 'info' })}
      >
        Toolbox
      </button>
    </div>
  );
};

export default Toolbox; 