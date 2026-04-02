import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MojProfil.css';

const MojProfil = () => {
  const navigate = useNavigate();
  
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!userData || !token) {
    return (
      <div className="profile-container-center">
        <h2>Niste ulogovani</h2> 

        <button className="btn-bordo-small" onClick={() => navigate("/login")}>
          Idi na prijavu
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    alert("Uspešno ste se odjavili!");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <div className="back-button-container">
              <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
      <div className="profile-card">
        <h2 className="profile-title">Moj Profil</h2>
        <hr />
        <div className="profile-info">
          <div className="info-group">
            <label>Email adresa:</label>
            <p>{userData.email}</p>
          </div>
          <div className="info-group">
            <label>Broj studentske kartice:</label>
            <p>{userData['stud-kartica']}</p>
          </div>
          <div className="info-group">
            <label>Status:</label>
            <p>{userData['status']}</p>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Odjavi se
        </button>
      </div>
    </div>
  );
};

export default MojProfil;