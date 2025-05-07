import React, { useEffect } from 'react';
import { useGlobalState } from './GlobalStateContext';

const Snackbar = () => {
  const { snackbar, setSnackbar } = useGlobalState();

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar, setSnackbar]);

  if (!snackbar.open) return null;

  return (
    <div className="snackbar" style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '12px 24px', borderRadius: 8, zIndex: 10000 }}>
      {snackbar.message}
    </div>
  );
};

export default Snackbar; 