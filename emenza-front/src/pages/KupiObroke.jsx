import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../css/KupiObroke.css';
import { useNavigate } from 'react-router-dom';

const KupiObroke = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [selectedTab, setSelectedTab] = useState('DORUČAK');
    const [quantity, setQuantity] = useState(0);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const months = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    const currentMonth = months[new Date().getMonth()];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/meals/my-status?token=${token}`);
                setStats(res.data);
            } catch (err) {
                console.error("Greška:", err);
            }
        };
        if (token) fetchStats();
    }, [token]);

    if (!stats) return <div className="loading">Učitavanje podataka...</div>;

    const dayOfMonth = new Date().getDate();
    const isBudget = user?.status === 'budzet';
    const canUseSingleStep = !isBudget || dayOfMonth > 21;

    const getPreostalo = () => {
        if (selectedTab === 'DORUČAK') return stats.dorucak_preo;
        if (selectedTab === 'RUČAK') return stats.rucak_preo;
        if (selectedTab === 'VEČERA') return stats.vecera_preo;
        return 0;
    };

    const handleQuantityChange = (amount) => {
        const preostalo = getPreostalo();
        setQuantity(prev => {
            const next = prev + amount;
            if (next < 0) return 0;
            if (next > preostalo) return preostalo;
            return next;
        });
    };

    const handlePurchase = async () => {
        try {
            await axios.post(`http://localhost:8000/meals/purchase?token=${token}&meal_type=${selectedTab}&amount=${quantity}`);
            alert("Uspešno ste kupili obroke!");
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.detail || "Greška pri kupovini");
        }
    };

    return (
        <div className="purchase-container">
            <Navbar />
            <div className="back-button">
              <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
            <div className="purchase-content">
                <div className="balance-header">
                    <div className="balance-info">
                        <span className="balance-label">Stanje novca na kartici:</span>
                        <span className="balance-amount">356.00 RSD</span>
                    </div>
                    <button className="btn-bordo-small" onClick={() => {navigate('/uplata-novca')}}>Uplati novac</button>
                </div>

                <h2 className="month-title">{currentMonth}</h2>

                <div className="purchase-card">
                    <div className="tabs">
                        {['DORUČAK', 'RUČAK', 'VEČERA'].map(tab => (
                            <div 
                                key={tab}
                                className={`tab-item ${selectedTab === tab ? 'active' : ''}`}
                                onClick={() => { setSelectedTab(tab); setQuantity(0); }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div className="selection-info">
                        <h3>{selectedTab} - {currentMonth}</h3>
                        <p>Preostalo za kupovinu: <strong>{getPreostalo()}</strong></p>
                    </div>

                    <div className="stepper-container">
                        <button className="step-btn" onClick={() => handleQuantityChange(-10)}>-10</button>
                        <button 
                            className={`step-btn ${!canUseSingleStep ? 'disabled-btn' : ''}`} 
                            disabled={!canUseSingleStep} 
                            onClick={() => handleQuantityChange(-1)}
                        >
                            -1
                        </button>
                        
                        <div className="quantity-display">{quantity}</div>
                        
                        <button 
                            className={`step-btn ${!canUseSingleStep ? 'disabled-btn' : ''}`} 
                            disabled={!canUseSingleStep} 
                            onClick={() => handleQuantityChange(1)}
                        >
                            +1
                        </button>
                        <button className="step-btn" onClick={() => handleQuantityChange(10)}>+10</button>
                    </div>
                </div>

                <button 
                    className="btn-bordo-large" 
                    onClick={handlePurchase} 
                    disabled={quantity === 0}
                >
                    Kupi
                </button>
            </div>
        </div>
    );
};

export default KupiObroke;