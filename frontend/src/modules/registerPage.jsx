// frontend/src/components/RegisterPage.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Nav } from 'react-bootstrap';

function RegisterPage({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal melakukan registrasi');
      }
      
      setMessage('Registrasi berhasil! Silakan pindah ke halaman login.');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h3 className="text-center mb-4">Register</h3>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        
        <Form.Group className="mb-3">
          <Form.Label>Nama</Form.Label>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>

        <div className="d-grid">
          <Button variant="primary" type="submit">Register</Button>
        </div>
      </Form>
      <Nav className="justify-content-center mt-3">
        <Nav.Link onClick={onSwitchToLogin}>Sudah punya akun? Login</Nav.Link>
      </Nav>
    </>
  );
}

export default RegisterPage;