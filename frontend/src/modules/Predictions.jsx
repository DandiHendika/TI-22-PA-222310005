// frontend/src/components/Prediction.jsx
import React, { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import FormInput from '../modules/formInput';
import HistoryPage from './HistoryPage';

function Prediction({ onLogout, user }) {
  const [view, setView] = useState('form'); // 'form' atau 'history'

const handleLogoutClick = () => {
    // Tampilkan kotak dialog konfirmasi
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      // Jika user menekan "OK", panggil fungsi onLogout
      onLogout();
    }
    // Jika user menekan "Cancel", tidak terjadi apa-apa
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Navigasi untuk beralih tampilan */}
        <Nav variant="pills" defaultActiveKey="form" onSelect={(selectedKey) => setView(selectedKey)}>
          <Nav.Item>
            <Nav.Link eventKey="form">Form Prediksi</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">Riwayat</Nav.Link>
          </Nav.Item>
        </Nav>
        <div className="d-flex align-items-center">
          {user && ( // Tampilkan jika data user sudah ada
            <span className="me-3">
              Selamat datang, <strong>{user.name}</strong>
            </span>
          )}
          <Button variant="outline-secondary" size="sm" onClick={handleLogoutClick}>
            Logout
          </Button>
        </div>
      </div>
      
      {view === 'form' ? (
        <>
          <p className="text-center text-muted mb-4">
            Masukkan data Anda untuk mendapatkan estimasi risiko diabetes.
          </p>
          <FormInput />
        </>
      ) : (
        <HistoryPage />
      )}
    </div>
  );
}

export default Prediction;