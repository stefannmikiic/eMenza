import React from 'react';
import '../css/Pocetna.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Pocetna = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const months = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
    const today = new Date();
    const currentMonthName = months[today.getMonth()]; 
    const formattedDate = today.toLocaleDateString('sr-RS');   
    const cardData = {
    cardNumber: "05514265",
    balance: "356.00 RSD",
    validUntil: formattedDate,
    month: currentMonthName
  };
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="info-section">
        <div className="info-group">
          <span className="info-label">Broj kartice</span>
          <span className="info-value">{user['stud-kartica']}</span>
        </div>
        <div className="info-group">
          <span className="info-label">Stanje novca na kartici</span>
          <span className="info-value">{cardData.balance}</span>
        </div>
      </div>

      <div className="meals-card">
        <h3 className="meals-title">Obroci za {cardData.month}</h3>
        
        <table className="meals-table">
          <thead>
            <tr>
              <th></th>
              <th>DORUČAK</th>
              <th>RUČAK</th>
              <th>VEČERA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-label">Raspoloživo obroka</td>
              <td>0</td>
              <td>6</td>
              <td>3</td>
            </tr>
            <tr>
              <td className="row-label">Preostalo za kupovinu</td>
              <td>21</td>
              <td>21</td>
              <td>21</td>
            </tr>
            <tr>
              <td className="row-label">Danas potrošeno</td>
              <td>0</td>
              <td>1</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>

        <div className="meals-actions">
          <button className="btn-bordo" onClick={() => navigate('/uplata-novca')}>Uplati novac</button>
          <button className="btn-bordo" onClick={() => navigate('/kupi-obroke')}>Kupi obroke</button>
        </div>
      </div>

      <div className="validity-section">
        <div className="info-group">
          <span className="info-label">Kartica važi do:</span>
          <span className="info-value">{cardData.validUntil}</span>
        </div>
        <button className="btn-bordo btn-produce" onClick={() => navigate('/produzi-karticu')}>Produži</button>
      </div>
    </div>
  );
};

export default Pocetna;