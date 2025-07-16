// src/modules/formInput.jsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';

function FormInput() {
  const [formData, setFormData] = useState({
    gender: 'Female',
    age: '50',
    hypertension: '0',
    heart_disease: '0',
    height: '160',
    weight: '60',
    HbA1c_level: '5.8',
    blood_glucose_level: '140',
  });

  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    // Validasi untuk input numerik
    if (['age', 'height', 'weight', 'blood_glucose_level'].includes(name)) {
      if (value.length > 3) return; // Batasi maksimal 3 digit
      
      const numValue = parseInt(value, 10);
      if (name === 'age' && numValue > 150) return;
      if (name === 'height' && numValue > 280) return;
    }
    
    // Logika khusus untuk dropdown HbA1c
    if (name === "HbA1c_level") {
      if (value === "custom") {
        setIsCustomHba1c(true);
        // Jangan langsung ubah value di formData jika memilih custom
        newFormData[name] = ''; // Kosongkan untuk input manual
      } else {
        setIsCustomHba1c(false);
        newFormData[name] = value;
      }
    } else {
      newFormData[name] = value;
    }
    
    setFormData(newFormData);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setError('');

    // 1. Ambil token dari localStorage
    const token = localStorage.getItem('token');

    // 2. Cek jika token tidak ada
    if (!token) {
        setError("Autentikasi gagal. Silakan login kembali.");
        setIsLoading(false);
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 3. Pastikan baris ini ada dan benar
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData),
        });

        // Error 422 akan ditangkap di sini juga
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.msg || 'Terjadi kesalahan pada server');
        }
        
        const result = await response.json();
        setPrediction(result.prediction);
        setProbability(result.probability);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <>
      <Form onSubmit={handleSubmit}>
        {/* Baris 1: Jenis Kelamin & Usia */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Jenis Kelamin</Form.Label>
              <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Female">Perempuan</option>
                <option value="Male">Laki-laki</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Usia</Form.Label>
              <Form.Control type="number" name="age" value={formData.age} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        {/* Baris 2: Hipertensi & Penyakit Jantung */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Memiliki Hipertensi?</Form.Label>
              <Form.Select name="hypertension" value={formData.hypertension} onChange={handleChange}>
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Memiliki Penyakit Jantung?</Form.Label>
              <Form.Select name="heart_disease" value={formData.heart_disease} onChange={handleChange}>
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Baris 3: Tinggi & Berat Badan */}
        <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tinggi Badan (cm)</Form.Label>
              <Form.Control type="number" name="height" value={formData.height} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Berat Badan (kg)</Form.Label>
              <Form.Control type="number" name="weight" value={formData.weight} onChange={handleChange} required />
            </Form.Group>
          </Col>
        
        {/* Baris 4: HbA1c & Glukosa */}
        <Row>
           <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kondisi Gula Darah (HbA1c)</Form.Label>
              {isCustomHba1c ? (
                <InputGroup>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="HbA1c_level" 
                    value={formData.HbA1c_level} 
                    onChange={handleChange} 
                    placeholder="Masukkan nilai HbA1c"
                    required 
                  />
                  <Button variant="outline-secondary" onClick={() => setIsCustomHba1c(false)}>
                    Pilih Opsi
                  </Button>
                </InputGroup>
              ) : (
                <Form.Select name="HbA1c_level" value={formData.HbA1c_level} onChange={handleChange}>
                  <option value="5.8">Saya tidak tahu</option>
                  <option value="5.0">Normal</option>
                  <option value="6.0">Berisiko / Pra-diabetes</option>
                  <option value="7.0">Sudah Didiagnosis Diabetes</option>
                  <option value="custom">Masukkan Nilai Sendiri...</option>
                </Form.Select>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kadar Glukosa Darah Terakhir</Form.Label>
              <Form.Control type="number" name="blood_glucose_level" value={formData.blood_glucose_level} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-grid mt-3">
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <><Spinner as="span" animation="border" size="sm" /> Memprediksi...</> : 'Lakukan Prediksi'}
          </Button>
        </div>
      </Form>
      <div className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {prediction && (
          <Alert variant={prediction.includes('Positif') ? 'warning' : 'success'}>
            <Alert.Heading>Hasil Prediksi: {prediction}</Alert.Heading>
            <p className="mb-0">Model memprediksi hasilnya dengan tingkat kepercayaan sekitar <strong>
              {prediction.includes('Positif') 
                ? (probability.positif * 100).toFixed(2) 
                : (probability.negatif * 100).toFixed(2)}%
            </strong>.</p>
          </Alert>
        )}
      </div>
    </>
  );
}

export default FormInput;