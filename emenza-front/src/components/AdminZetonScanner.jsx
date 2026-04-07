import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import '../css/AdminScanner.css';

const AdminZetonScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedToken, setScannedToken] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        scannerRef.current = new Html5Qrcode("reader");
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.log(err));
            }
        };
    }, []);

    const startScanner = async () => {
        setIsScanning(true);
        setScannedToken(null);
        setStatusMessage(null);
        setError(null);
        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess
            );
        } catch {
            setError("Kamera nije dostupna.");
            setIsScanning(false);
        }
    };

    const onScanSuccess = async (decodedText) => {
        await scannerRef.current.stop();
        setIsScanning(false);
        setScannedToken(decodedText);
    };

    const handleZetonAction = async (vratioEscajg) => {
        try {
            const response = await axios.post(`http://localhost:8000/meals/return-zeton?vratio=${vratioEscajg}`, {
                qr_token: scannedToken
            });
            setStatusMessage(response.data.message);
            setScannedToken(null);
        } catch (err) {
            setError(err.response?.data?.detail || "Greška na serveru");
        }
    };

    return (
        <div className="admin-scanner-container">
            <div className="admin-scanner-title">
            <h1>Vraćanje žetona (Escajg) 🍽️</h1>
            </div>


            <div id="reader" style={{ width: '100%', display: scannedToken ? 'none' : 'block' }}></div>

            {!isScanning && !scannedToken && (
                <button onClick={startScanner} className="zeton-start-btn">Skeniraj za vraćanje žetona</button>
            )}

            {scannedToken && (
                <div className="zeton-actions">
                    <h3>Korisnik skeniran! Da li je vratio escajg?</h3>
                    <div className="button-group">
                        <button 
                            onClick={() => handleZetonAction(true)} 
                            className="confirm-btn"
                            style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', margin: '10px' }}
                        >
                            ✅ VRATIO ESCAJG (Vrati žeton)
                        </button>
                        <button 
                            onClick={() => handleZetonAction(false)} 
                            className="reject-btn"
                            style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', margin: '10px' }}
                        >
                            ❌ NIJE VRATIO (Zadrži žeton)
                        </button>
                    </div>
                </div>
            )}

            {statusMessage && <div className="result-success">✅ {statusMessage}</div>}
            {error && <div className="result-error">❌ {error}</div>}

            {(statusMessage || error) && (
                <button onClick={startScanner} className="reset-btn">Sledeći student</button>
            )}
        </div>
    );
};

export default AdminZetonScanner;