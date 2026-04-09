import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('statistika');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes, reqRes] = await Promise.all([
                    axios.get('http://localhost:8000/admin/stats'),
                    axios.get('http://localhost:8000/users'),
                    axios.get('http://localhost:8000/admin/renewal-requests')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setRequests(reqRes.data);
            } catch (err) {
                console.error("Greška pri učitavanju:", err);
            }
        };
        fetchData();
    }, []);

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/admin/update-user/${editingUser.id}`, editingUser);
            alert("Podaci uspešno ažurirani!");
            setEditingUser(null);
            const res = await axios.get('http://localhost:8000/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Greška pri ažuriranju:", err);
            alert("Greška pri ažuriranju.");
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await axios.post(`http://localhost:8000/admin/process-request/${requestId}?status=${status}`);
            setRequests(requests.filter(r => r.id !== requestId));
            alert(`Zahtev je ${status === 'approved' ? 'odobren' : 'odbijen'}.`);
        } catch (err) {
            console.error("Greška pri obradi zahteva:", err);
            alert("Greška pri obradi zahteva.");
        }
    };

    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.stud_kartica?.includes(searchTerm)
    );

    return (
        <div className="admin-container">
            <aside className="admin-sidebar" style={{ backgroundColor: '#253965' }}>
                <h2 style={{ color: '#fff' }}>eMenza Admin </h2>
                <button className={activeTab === 'statistika' ? 'active' : ''} onClick={() => setActiveTab('statistika')}>📊 Statistika</button>
                <button className={activeTab === 'korisnici' ? 'active' : ''} onClick={() => setActiveTab('korisnici')}>👥 Korisnici</button>
                <button className={activeTab === 'zahtevi' ? 'active' : ''} onClick={() => setActiveTab('zahtevi')}>📄 Zahtevi ({requests.length})</button>
            </aside>

            <main className="admin-content">
                {activeTab === 'statistika' && (
                    <section>
                        <h2>Globalna Statistika</h2>
                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderTopColor: '#74222a' }}>
                                <h3>Ukupno korisnika</h3>
                                <p>{users.length}</p>
                            </div>
                            <div className="stat-card" style={{ borderTopColor: '#253965' }}>
                                <h3>Današnji obroci</h3>
                                <p>{stats.today_meals || 0}</p>
                            </div>
                            <div className="stat-card" style={{ borderTopColor: '#74222a' }}>
                                <h3>Žetoni kod studenata</h3>
                                <p>{stats.total_zetons || 0}</p>
                            </div>
                            <div className="stat-card" style={{ borderTopColor: '#253965' }}>
                                <h3>Ukupan prihod (RSD)</h3>
                                <p>{stats.total_revenue?.toLocaleString('sr-RS') || 0} RSD</p>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'korisnici' && (
                    <section>
                        <h2>Upravljanje korisnicima</h2>
                        <input 
                            type="text" 
                            placeholder="Pretraži..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-bar"
                        />
                        <table className="admin-table">
                            <thead>
                                <tr style={{ backgroundColor: '#253965', color: 'white' }}>
                                    <th>Email</th>
                                    <th>Kartica</th>
                                    <th>Status</th>
                                    <th>Balans</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.email}</td>
                                        <td>{u.stud_kartica}</td>
                                        <td style={{ color: u.status === 'budzet' ? '#74222a' : '#253965', fontWeight: 'bold' }}>{u.status}</td>
                                        <td>{u.balance} RSD</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => setEditingUser(u)} style={{ backgroundColor: '#253965' }}>Izmeni</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {activeTab === 'zahtevi' && (
                    <section>
                        <h2>Zahtevi za produženje ({requests.length})</h2>
                        <div className="requests-list">
                            {requests.map(req => (
                                <div key={req.id} className="request-card">
                                    <p><strong>Korisnik ID:</strong> {req.user_id}</p>
                                    <div className="docs-preview">
                                        <a href={`http://localhost:8000${req.potvrda_o_studiranju_path}`} target="_blank" rel="noreferrer">📄 Potvrda</a>
                                        <a href={`http://localhost:8000${req.skenirani_indeks_path}`} target="_blank" rel="noreferrer">🪪 Indeks</a>
                                    </div>
                                    <div className="request-btns">
                                        <button onClick={() => handleRequestAction(req.id, 'approved')} className="approve-btn">Odobri</button>
                                        <button onClick={() => handleRequestAction(req.id, 'rejected')} className="reject-btn">Odbij</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Izmena korisnika: {editingUser.email}</h3>
                            <form onSubmit={handleUpdateUser}>
                                <label>Broj kartice:</label>
                                <input type="text" value={editingUser.stud_kartica} onChange={e => setEditingUser({...editingUser, stud_kartica: e.target.value})} />
                                
                                <label>Balans (RSD):</label>
                                <input type="number" value={editingUser.balance} onChange={e => setEditingUser({...editingUser, balance: e.target.value})} />
                                
                                <label>Status:</label>
                                <select value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                                    <option value="budzet">Budžet</option>
                                    <option value="samofinansiranje">Samofinansiranje</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <div className="modal-actions">
                                    <button type="submit" className="save-btn">Sačuvaj</button>
                                    <button type="button" className="cancel-btn" onClick={() => setEditingUser(null)}>Otkaži</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;