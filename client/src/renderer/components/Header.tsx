import React from 'react';
import './Header.css';
import logo from '../assets/logo.svg';

const Header: React.FC = () => {
  return (
    <div className="header-bar">
      <img src={logo} alt="Logo" className="header-logo" />
      <h1 className="header-title">BachPropagation</h1>
    </div>
  );
};

export default Header; 