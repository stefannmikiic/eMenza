import React, { useRef, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../css/ProduziKarticu.css';
import { useNavigate } from 'react-router-dom';

const ProduziKarticu = () => {
    const navigate = useNavigate();
    const potvrdaInputRef = useRef(null);
    const indeksInputRef = useRef(null);
    const [potvrdaFile, setPotvrdaFile] = useState(null);
    const [indeksFile, setIndeksFile] = useState(null);

    const handlePotvrdaChange = (event) => {
        const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
        setPotvrdaFile(file);
    };

    const handleIndeksChange = (event) => {
        const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
        setIndeksFile(file);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Niste prijavljeni.');
            return;
        }

        if (!potvrdaFile || !indeksFile) {
            alert('Molimo vas da priložite oba dokumenta.');
            return;
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('potvrda', potvrdaFile);
        formData.append('indeks', indeksFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/card-renewal/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert(response.data?.message || 'Zahtev za produžetak kartice je uspešno poslat.');
            setPotvrdaFile(null);
            setIndeksFile(null);

            if (potvrdaInputRef.current) {
                potvrdaInputRef.current.value = '';
            }

            if (indeksInputRef.current) {
                indeksInputRef.current.value = '';
            }
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Došlo je do greške prilikom slanja zahteva.';
            alert(message);
        }
    };

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
                            <input
                                ref={potvrdaInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handlePotvrdaChange}
                            />
                            <span className="paperclip-icon">📎</span> priložiti ovde
                        </label>
                        <span className="upload-file-name">
                            {potvrdaFile ? potvrdaFile.name : 'Nijedan fajl nije izabran'}
                        </span>
                    </div>

                    <div className="upload-group">
                        <span className="upload-label">Skenirani indeks:</span>
                        <label className="upload-link">
                            <input
                                ref={indeksInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleIndeksChange}
                            />
                            <span className="paperclip-icon">📎</span> priložiti ovde
                        </label>
                        <span className="upload-file-name">
                            {indeksFile ? indeksFile.name : 'Nijedan fajl nije izabran'}
                        </span>
                    </div>

                    <button className="btn-bordo-renewal" onClick={handleSubmit}>Pošalji zahtev</button>
                </div>
            </div>
        </div>
    );
};

export default ProduziKarticu;