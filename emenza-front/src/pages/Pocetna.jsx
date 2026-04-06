import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/Pocetna.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Pocetna = () => {
  const navigate = useNavigate();
  const [mealStats, setMealStats] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const lastSpacePressRef = useRef(0);
  const isConsumingRef = useRef(false);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/meals/my-status?token=${token}`);
        setMealStats(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju obroka:", err);
      }
    };

    if (token) fetchMeals();
  }, [token]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.code !== 'Space') return;

      const target = e.target;
      const tagName = target?.tagName?.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable
      ) {
        return;
      }

      const now = Date.now();

      if (now - lastSpacePressRef.current <= 400) {
        lastSpacePressRef.current = 0;

        if (!token || isConsumingRef.current) return;

        try {
          isConsumingRef.current = true;
          const res = await axios.post(`http://localhost:8000/meals/consume?token=${token}`);
          setMealStats(res.data.new_data);
        } catch (err) {
          alert(err?.response?.data?.detail || 'Došlo je do greške');
        } finally {
          isConsumingRef.current = false;
        }

        return;
      }

      lastSpacePressRef.current = now;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [token]);

  const months = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
  const today = new Date();
  const currentMonthName = months[today.getMonth()];
  const formattedDate = today.toLocaleDateString('sr-RS');

  if (!mealStats) return <div className="loading">Učitavanje...</div>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="info-section">
        <div className="info-group">
          <span className="info-label">Broj kartice</span>
          <span className="info-value">{user?.['stud-kartica']}</span>
        </div>
        <div className="info-group">
          <span className="info-label">Stanje novca na kartici</span>
          <span className="info-value">{mealStats.user_balance ? `${mealStats.user_balance.toFixed(2)} RSD` : "0.00 RSD"}</span>
        </div>
      </div>

      <div className="meals-card">
        <h3 className="meals-title">Obroci za {currentMonthName}</h3>
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
              <td className={mealStats.dorucak_rasp > 0 ? "has-meals" : ""}>{mealStats.dorucak_rasp}</td>
              <td className={mealStats.rucak_rasp > 0 ? "has-meals" : ""}>{mealStats.rucak_rasp}</td>
              <td className={mealStats.vecera_rasp > 0 ? "has-meals" : ""}>{mealStats.vecera_rasp}</td>
            </tr>
            <tr>
              <td className="row-label">Preostalo za kupovinu</td>
              <td>{mealStats.dorucak_preo}</td>
              <td>{mealStats.rucak_preo}</td>
              <td>{mealStats.vecera_preo}</td>
            </tr>
            <tr>
              <td className="row-label">Danas potrošeno</td>
              <td>{mealStats.dorucak_danas}</td>
              <td>{mealStats.rucak_danas}</td>
              <td>{mealStats.vecera_danas}</td>
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
          <span className="info-value">{formattedDate}</span>
        </div>
        <button className="btn-bordo btn-produce" onClick={() => {navigate('/produzi-karticu')}}>Produži</button>
      </div>
    </div>
  );
};

export default Pocetna;