import React from 'react';
import Navbar from '../components/Navbar';
import '../css/ProduziKarticu.css';
import { useNavigate } from 'react-router-dom';

const ProduziKarticu = () => {
    const navigate = useNavigate();
    return (
        <div className="renewal-container">
            <Navbar />
            <div className="back-button">
              <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
            <div className="renewal-content">
                <h1 className="renewal-main-title">Obaveštenje!</h1>

                <div className="renewal-card renewal-notice">
                    <p>
                        Podnošenje zahteva za produžetak kartice je moguće najranije 
                        <strong> 3 dana pre njenog isteka</strong>. Potrebno je priložiti 
                        potrebna dokumenta i minimalno stanje novca na kartici mora biti 1000 RSD. 
                        Informacije i potvrda o produžetku kartice biće poslati na Vašu adresu 
                        korišćenu prilikom registracije.
                    </p>
                </div>

                <div className="renewal-card renewal-form-card">
                    <h2 className="renewal-form-title">Zahtev za produžetak kartice</h2>

                    <div className="upload-group">
                        <span className="upload-label">Potvrda o studiranju:</span>
                        <label className="upload-link">
                            <input type="file" style={{ display: 'none' }} />
                            <span className="paperclip-icon">📎</span> priložiti ovde
                        </label>
                    </div>

                    <div className="upload-group">
                        <span className="upload-label">Skenirani indeks:</span>
                        <label className="upload-link">
                            <input type="file" style={{ display: 'none' }} />
                            <span className="paperclip-icon">📎</span> priložiti ovde
                        </label>
                    </div>

                    <button className="btn-bordo-renewal">Pošalji zahtev</button>
                </div>
            </div>
        </div>
    );
};

export default ProduziKarticu;