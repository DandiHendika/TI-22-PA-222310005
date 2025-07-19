// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import LoginPage from './modules/loginPage';
import RegisterPage from './modules/registerPage';
import Prediction from './modules/Predictions';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'register', atau 'prediction'
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async (currentToken) => {
    if (!currentToken) return;
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil profil');
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error(error);
      // Jika token tidak valid, logout
      handleLogout(); 
    }
  };

  // Cek token di localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
      setView('prediction');
    }
  }, []);

  // Fungsi ini dipanggil dari LoginPage setelah login berhasil
  const handleLoginSuccess = () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setView('prediction');
    fetchUserProfile(storedToken);
  };

  // Fungsi ini dipanggil dari Prediction.jsx untuk logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari penyimpanan
    setToken(null);
    setView('login');
  };

  // Fungsi untuk menentukan komponen mana yang akan ditampilkan
  const renderView = () => {
    switch (view) {
      case 'register':
        return <RegisterPage onSwitchToLogin={() => setView('login')} />;
      case 'prediction':
        return <Prediction user={userProfile} onLogout={handleLogout} />;
      case 'login':
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setView('register')} />;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="form-container">
            <h4 className="text-center mb-4">Prediksi Risiko Diabetes</h4>
            {renderView()}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;