import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../css/KupiObroke.css';
import { useNavigate } from 'react-router-dom';

const KupiObroke = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('Izaberi obrok');
    const [quantity, setQuantity] = useState(0);

    const months = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    const currentMonth = months[new Date().getMonth()];

    const handleQuantityChange = (amount) => {
        if (selectedTab === 'Izaberi obrok') return;
        setQuantity(prev => Math.max(0, prev + amount));
        setQuantity(prev => Math.min(21, prev));
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
                                onClick={() => setSelectedTab(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div className="selection-info">
                        <h3>{selectedTab} - {currentMonth}</h3>
                        <p>Preostalo za kupovinu: <strong>21</strong></p>
                    </div>

                    <div className="stepper-container">
                        <button className="step-btn" onClick={() => handleQuantityChange(-10)}>-10</button>
                        <button className="step-btn" onClick={() => handleQuantityChange(-1)}>-1</button>
                        <div className="quantity-display">{quantity}</div>
                        <button className="step-btn" onClick={() => handleQuantityChange(1)}>+1</button>
                        <button className="step-btn" onClick={() => handleQuantityChange(10)}>+10</button>
                    </div>
                </div>

                <button className="btn-bordo-large">Kupi</button>
            </div>
        </div>
    );
};

export default KupiObroke;