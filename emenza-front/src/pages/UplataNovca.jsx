import React from 'react';
import Navbar from '../components/Navbar';
import '../css/UplataNovca.css';
import { useNavigate } from 'react-router-dom';

const UplataNovca = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const paymentData = {
        balance: "356.00 RSD",
        recipientAccount: "150-3000005426-15",
        model: "54",
        referenceNumber: "05514265"
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
                        <span className="info-value">{paymentData.balance}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Račun primaoca:</span>
                        <span className="info-value">{paymentData.recipientAccount}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Model:</span>
                        <span className="info-value">{paymentData.model}</span>
                    </div>

                    <div className="payment-info-group">
                        <span className="info-label">Poziv na broj:</span>
                        <span className="info-value">{user['stud-kartica']}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UplataNovca;