import React, { useState, useEffect } from 'react'; // Dodati importi
import axios from 'axios'; // Dodat import
import Navbar from '../components/Navbar';
import '../css/UplataNovca.css';
import { useNavigate } from 'react-router-dom';

const UplataNovca = () => {
    const navigate = useNavigate();
    const [mealStats, setMealStats] = useState(null);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

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

    // Pomoćna funkcija za formatiranje stanja
    const formatBalance = () => {
        if (!mealStats) return "Učitavanje...";
        return `${mealStats.user_balance.toFixed(2)} RSD`;
    };

    // Fiksne informacije o uplati
    const paymentInfo = {
        recipientAccount: "150-3000005426-15",
        model: "54",
        referenceNumber: user?.['stud-kartica'] || "Nema podataka"
    };

    return (
        <div className="payment-container">
            <Navbar />
            <div className="back-button">
              <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
            <div className="payment-content">
                <h1 className="payment-main-title">Obaveštenje!</h1>

                <div className="payment-card notice-card">
                    <p>
                        Uplatu novca je moguće izvršiti na 
                        <strong> blagajni</strong>, <strong>aparatima</strong> kao i na 
                        <strong> račun Studentskog centra</strong> sa pozivom na broj koji 
                        predstavlja broj kartice studenta.
                    </p>
                </div>

                <div className="payment-card info-card">
                    <h2 className="info-title">Informacije o uplati novca</h2>

                    <div className="payment-info-group">
                        <span className="info-label">Stanje novca na kartici:</span>
                        <span className="info-value">{formatBalance()}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Račun primaoca:</span>
                        <span className="info-value">{paymentInfo.recipientAccount}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Model:</span>
                        <span className="info-value">{paymentInfo.model}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Poziv na broj (Vaša kartica):</span>
                        <span className="info-value">{paymentInfo.referenceNumber}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UplataNovca;