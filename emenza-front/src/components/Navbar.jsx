import React from 'react'
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
      const navigate = useNavigate();

  return (
    <div className='nav-bar'>
        <h2 className='nav-title' onClick={() => {navigate('/')}}>eMenza</h2>
        <div className="right-navbar">
          <div className="account-section">
            <span id="account-icon" className="profile-icon" onClick={() => {navigate('/profil')}}><CgProfile /> Korisnik</span>
          </div>
      </div>
        
    </div>
  )
}

export default Navbar