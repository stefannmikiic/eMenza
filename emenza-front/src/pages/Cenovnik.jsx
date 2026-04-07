import React from 'react'
import Navbar from '../components/Navbar';
import '../css/Cenovnik.css';
import { useNavigate } from 'react-router-dom';

const Cenovnik = () => {
    const navigate = useNavigate();
  return (
    <div>
        <Navbar></Navbar>
         <div className="back-button">
              <button className="btn-bordo-small" onClick={() => navigate(-1)}>Nazad</button>
            </div>
        <h1 className='cenovnik-title'>Cenovnik</h1>
        <div className="cenovnik-table">
            <table>
                <thead>
                    <tr>
                        <th>Obrok</th>
                        <th>Budžetske cene (po obroku)</th>
                        <th>Ekonomske cene (po obroku)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Doručak</td>
                        <td>56,00 RSD</td>
                        <td>190,00 RSD</td>
                    </tr>
                    <tr>
                        <td>Ručak</td>
                        <td>120,00 RSD</td>
                        <td>450,00 RSD</td>
                    </tr>
                    <tr>
                        <td>Večera</td>
                        <td>90,00 RSD</td>
                        <td>380,00 RSD</td>
                    </tr>
                    <tr className='total-row'>
                        <td>Dnevno</td>
                        <td>266,00 RSD</td>
                        <td>1020,00 RSD</td>
                    </tr>
                    </tbody>
            </table>
        </div>
    </div>
  )
}

export default Cenovnik