import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import '../css/UplataNovca.css';

const KupiZetone = () => {
    const navigate = useNavigate();
    const [mealStats, setMealStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/meals/my-status?token=${token}`);
            setMealStats(res.data);
        } catch (err) {
            console.error("Greška:", err);
        }
    };

    useEffect(() => {
        if (token) fetchStatus();
    }, [token]);

    const handleBuyZeton = async () => {
        if (!window.confirm("Da li ste sigurni da želite da kupite žeton za 1000.00 RSD?")) return;
        
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/meals/kupi-zetone?token=${token}`);
            alert(res.data.message);
            setMealStats(res.data.new_data);
        } catch (err) {
            alert(err.response?.data?.detail || "Greška pri kupovini");
        } finally {
            setLoading(false);
        }
    };

    if (!mealStats) return <div className="loading">Učitavanje...</div>;

    return (
        <div className="payment-container">
            <Navbar />
            <div className="back-button">
                <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
            
            <div className="payment-content">
                <h1 className="payment-main-title">Kupovina žetona</h1>
                
                <div className="payment-card info-card">
                    <h2 className="info-title">Vaše stanje</h2>
                    <div className="payment-info-group">
                        <span className="info-label">Novac na kartici:</span>
                        <span className="info-value">{mealStats.user_balance.toFixed(2)} RSD</span>
                    </div>
                    <div className="payment-info-group">
                        <span className="info-label">Trenutno žetona:</span>
                        <span className="info-value">{mealStats.zeton_balance}</span>
                    </div>
                </div>

                <div className="payment-card notice-card" style={{textAlign: 'center', marginTop: '20px'}}>
                    <p style={{marginBottom: '15px'}}>Cena jednog žetona je <strong>1000.00 RSD</strong>.</p>
                    <button 
                        className="btn-bordo" 
                        onClick={handleBuyZeton}
                        disabled={loading || mealStats.user_balance < 1000}
                        style={{width: '100%', padding: '15px'}}
                    >
                        {loading ? "Obrađujem..." : "KUPI ŽETON"}
                    </button>
                    {mealStats.user_balance < 1000 && (
                        <p style={{color: '#ff8080', fontSize: '12px', marginTop: '10px'}}>
                            Nemate dovoljno novca za kupovinu žetona.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KupiZetone;