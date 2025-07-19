// frontend/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Nav } from 'react-bootstrap';

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Email atau password salah');
      }

      localStorage.setItem('token', data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h3 className="text-center mb-4">Login</h3>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>

        <div className="d-grid">
          <Button variant="primary" type="submit">Login</Button>
        </div>
      </Form>
      <Nav className="justify-content-center mt-3">
        <Nav.Link onClick={onSwitchToRegister}>Belum punya akun? Register</Nav.Link>
      </Nav>
    </>
  );
}

export default LoginPage;