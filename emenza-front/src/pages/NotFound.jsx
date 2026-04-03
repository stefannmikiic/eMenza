import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/NotFound.css';
import Navbar from '../components/Navbar';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
    
    <Navbar/>
    <div className="notfound-container">
      
      <div className="notfound-card">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtext">Stranica koju tražite ne postoji.</p>
        
        <button 
          className="btn-bordo-small-notfound" 
          onClick={() => navigate("/")}
        >
          POVRATAK NA POČETNU
        </button>
      </div>
    </div>
    </>
  );
};

export default NotFound;