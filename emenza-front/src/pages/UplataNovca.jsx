import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../css/UplataNovca.css';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const UplataNovca = () => {
    const navigate = useNavigate();
    const [mealStats, setMealStats] = useState(null);
    const [iznos, setIznos] = useState("");
    
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

    const formatBalance = () => {
        if (!mealStats) return "Učitavanje...";
        return `${mealStats.user_balance.toFixed(2)} RSD`;
    };

    const paymentInfo = {
        recipientAccount: "150300000542615",
        recipientName: "Studentski Centar",
        model: "54",
        referenceNumber: user?.['stud-kartica'] || "000000000"
    };
    const generateIPSString = () => {
        if (!iznos || isNaN(iznos)) return "";
        
        const formattedAmount = `RSD${iznos},00`;
        return `K:PR|V:01|C:1|R:${paymentInfo.recipientAccount}|N:${paymentInfo.recipientName}|I:${formattedAmount}|SF:289|S:Uplata obroka-${paymentInfo.referenceNumber}`;
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
            <div className="payment-content">
                <h1 className="payment-main-title">IPS Uplata Novca</h1>

                <div className="payment-layout">
                    <div className="payment-card info-card">
                        <h2 className="info-title">Podaci za uplatu</h2>
                        <div className="payment-info-group">
                            <span className="info-label">Vaše trenutno stanje:</span>
                            <span className="info-value">{mealStats ? `${mealStats.user_balance.toFixed(2)} RSD` : "..."}</span>
                        </div>

                        <div className="input-group">
                            <label>Unesite iznos uplate (RSD):</label>
                            <input 
                                type="number" 
                                value={iznos} 
                                onChange={(e) => setIznos(e.target.value)}
                                placeholder="Npr. 1500"
                                className="amount-input"
                            />
                        </div>
                    </div>

                    <div className="payment-card qr-card">
                        <h2 className="info-title-desno">Skeniraj i plati</h2>
                        {iznos >= 10 ? (
                            <div className="qr-wrapper">
                                <QRCodeSVG 
                                    value={generateIPSString()} 
                                    size={220}
                                    level="M"
                                    includeMargin={true}
                                />
                                <p className="qr-hint">Otvorite aplikaciju banke i skenirajte kod</p>
                            </div>
                        ) : (
                            <div className="qr-placeholder">
                                <p>Unesite iznos (minimum 10 RSD) za generisanje koda</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UplataNovca;