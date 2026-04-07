import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import '../css/AdminScanner.css';

const AdminScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        scannerRef.current = new Html5Qrcode("reader");

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => console.error("Greška pri gašenju:", err));
            }
        };
    }, []);

    const startScanner = async () => {
        setIsScanning(true);
        setScanResult(null);
        setError(null);

        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccess
            );
        } catch {
            setError("Kamera se ne može pokrenuti. Proverite dozvole.");
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (error) {
                console.error("Greška pri zaustavljanju:", error);
            }
        }
    };

    const onScanSuccess = async (decodedText) => {
        await stopScanner();
        
        try {
            const response = await axios.post('http://localhost:8000/meals/scan-consume', {
                qr_token: decodedText
            });
            setScanResult(response.data.message);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.detail || "Greška pri validaciji");
        }
    };

    return (
        <div className="admin-scanner-container">
            <div className="admin-scanner-title">
                <h1>Sistem za skeniranje 🛡️</h1>
            </div>

            <div id="reader" style={{ width: '100%', minHeight: '300px' }}></div>
            
            <div className="scanner-controls">
                {!isScanning ? (
                    <button onClick={startScanner} className="start-btn">
                        📷 Pokreni skeniranje
                    </button>
                ) : (
                    <button onClick={stopScanner} className="stop-btn">
                        🛑 Zaustavi kameru
                    </button>
                )}
            </div>

            {scanResult && <div className="result-success">✅ {scanResult}</div>}
            {error && <div className="result-error">❌ {error}</div>}
            
            {(scanResult || error) && !isScanning && (
                <button onClick={startScanner} className="reset-btn">
                    Skeniraj sledećeg studenta
                </button>
            )}
        </div>
    );
};

export default AdminScanner;