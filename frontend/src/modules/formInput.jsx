// src/modules/formInput.jsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

function FormInput() {
  const [formData, setFormData] = useState({
    age: '50',
    hypertension: '0',
    heart_disease: '0',
    height: '160',
    weight: '60',
    HbA1c_level: '5.8',
    blood_glucose_level: '',
    gender: 'female',
  });

  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [isCustomHba1c, setIsCustomHba1c] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // let newFormData = { ...formData };

    const integerFields = ['age', 'height', 'weight', 'blood_glucose_level'];
    if (integerFields.includes(name)) {
      // 1. Mencegah titik/desimal
      if (value.includes('.')) {
        return;
      }
      // 2. Batasi maksimal 3 digit
      if (value.length > 3) {
        return;
      }
      // 3. Mencegah nilai nol atau negatif (kecuali saat input kosong)
      const numValue = parseInt(value, 10);
      if (numValue <= 0 && value !== '') {
        return;
      }
    }
    
    // Logika khusus untuk dropdown HbA1c
    if (name === "HbA1c_level_select") {
      if (value === "custom") {
        setIsCustomHba1c(true);
        // Kosongkan nilai di state utama saat beralih ke custom
        setFormData(prev => ({ ...prev, HbA1c_level: '' }));
      } else {
        // Jika memilih opsi lain dari dropdown, kembali ke tampilan biasa
        setIsCustomHba1c(false);
        setFormData(prev => ({ ...prev, HbA1c_level: value }));
      }
      return; // Hentikan fungsi di sini setelah menangani dropdown
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
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
        const response = await fetch('http://localhost:5000/api/predict', {
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
                <option value="female">Perempuan</option>
                <option value="male">Laki-laki</option>
              </Form.Select>
              <Form.Text className="text-muted">Pilih jenis kelamin Anda</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Usia</Form.Label>
              <Form.Control type="number" name="age" value={formData.age} onChange={handleChange} required />
              <Form.Text className="text-muted">Masukkan usia Anda dalam tahun</Form.Text>
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
              <Form.Text className="text-muted">Apakah Anda memiliki riwayat hipertensi? (Darah tinggi)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Memiliki Penyakit Jantung?</Form.Label>
              <Form.Select name="heart_disease" value={formData.heart_disease} onChange={handleChange}>
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </Form.Select>
              <Form.Text className="text-muted">Apakah Anda memiliki riwayat penyakit jantung?</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Baris 3: Tinggi & Berat Badan */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tinggi Badan (cm)</Form.Label>
              <Form.Control type="number" name="height" value={formData.height} onChange={handleChange} required />
              <Form.Text className="text-muted">Masukkan tinggi badan Anda dalam sentimeter</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Berat Badan (kg)</Form.Label>
              <Form.Control type="number" name="weight" value={formData.weight} onChange={handleChange} required />
              <Form.Text className="text-muted">Masukkan berat badan Anda dalam kilogram</Form.Text>
            </Form.Group>
          </Col>
        </Row>
        
        {/* Baris 4: HbA1c & Glukosa */}
        <Row>
          {/* <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kondisi Gula Darah (HbA1c)</Form.Label>
              <Form.Select name="HbA1c_level" value={formData.HbA1c_level} onChange={handleChange}>
                <option value="5.8">Saya tidak tahu</option>
                <option value="5.0">Normal</option>
                <option value="6.0">Berisiko / Pra-diabetes</option>
                <option value="7.0">Sudah Didiagnosis Diabetes</option>
              </Form.Select>
            </Form.Group>
          </Col> */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Level HbA1c</Form.Label>
              {isCustomHba1c ? (
                <InputGroup>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="HbA1c_level" 
                    value={formData.HbA1c_level} 
                    onChange={handleChange} 
                    placeholder="Contoh: 6.5"
                    required 
                  />
                  <Button variant="outline-secondary" onClick={() => setIsCustomHba1c(false)}>
                    Pilih Opsi
                  </Button>
                </InputGroup>
              ) : (
                <Form.Select name="HbA1c_level_select" value={formData.HbA1c_level} onChange={handleChange}>
                  <option value="5.8">Saya tidak tahu</option>
                  <option value="5.6">Normal</option>
                  <option value="6.4">Sedang</option>
                  <option value="7.0">Tinggi</option>
                  <option value="custom">Masukkan Nilai Sendiri...</option>
                </Form.Select>
              )}
              <Form.Text className="text-muted">Pilih level HbA1c Anda selama 2 - 3 bulan terakhir. *Harap gunakan titik (.) sebagai pemisah desimal</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kadar Glukosa Darah Terakhir</Form.Label>
              <Form.Control type="number" name="blood_glucose_level" value={formData.blood_glucose_level} onChange={handleChange} />
              <Form.Text className="text-muted">Masukkan kadar glukosa darah terakhir Anda dalam mg/dL. *Kosongkan jika tidak tahu nilainya</Form.Text>
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
          
            <hr />
            {prediction.includes('Positif') ? (
              // Teks saran jika hasil POSITIF
              <div>
                <p className="mb-1"><strong>Saran untuk Anda:</strong></p>
                <ul className="text-start">
                  <li>Sangat disarankan untuk berkonsultasi dengan dokter atau fasilitas kesehatan terdekat untuk pemeriksaan lebih lanjut.</li>
                  <li>Mulai perhatikan pola makan dengan mengurangi asupan gula dan karbohidrat sederhana.</li>
                  <li>Tingkatkan aktivitas fisik secara bertahap, seperti berjalan kaki rutin setiap hari.</li>
                </ul>
              </div>
            ) : (
              // Teks saran jika hasil NEGATIF
              <div>
                <p className="mb-1"><strong>Saran untuk Anda:</strong></p>
                < ul className="text-start">
                  <li>Hasil ini adalah pertanda baik! Terus pertahankan gaya hidup sehat Anda.</li>
                  <li>Tingkat kepercayaan adalah berapa persen model yakin terhadap prediksi ini. Jadi jika tingkat kurang dari 60% maka sebaiknya lakukan pemeriksaan lebih lanjut.</li>
                  <li>Lakukan pemeriksaan kesehatan secara rutin untuk deteksi dini.</li>
                  <li>Tetap jaga pola makan seimbang dan aktif bergerak untuk menjaga kesehatan jangka panjang.</li>
                </ul>
              </div>
            )}
            <p className="mt-3 mb-0 fst-italic">
              <small>Ingat, hasil ini adalah prediksi berdasarkan data dan bukan diagnosis medis.</small>
            </p>
          </Alert>
        )}
      </div>
    </>
  );
}

export default FormInput;