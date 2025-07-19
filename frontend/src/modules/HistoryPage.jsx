// frontend/src/components/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Pagination } from 'react-bootstrap'; // 1. Tambahkan import Pagination

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 2. Tambahkan state untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Sesi tidak valid.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Gagal mengambil data riwayat.');
        }
        const data = await response.json();
        console.log("Data diterima dari /api/history:", data);
        setHistory(data);
      } catch (err) {
        console.error("Error saat fetch history:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 3. Logika untuk memotong data sesuai halaman
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  if (isLoading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (history.length === 0) {
    return <p className="text-center text-muted">Belum ada riwayat prediksi.</p>;
  }

  return (
    // 4. Bungkus semuanya dengan <>...</>
    <>
    <a>0 = Tidak dan 1 = Ya</a>
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Usia</th>
            <th>Jenis Kelamin</th>
            <th>Hipertensi</th>
            <th>Penyakit Jantung</th>
            <th>BMI</th>
            <th>HbA1c</th>
            <th>Glukosa</th>
            <th>Hasil</th>
            <th>Probabilitas</th>
          </tr>
        </thead>
        <tbody>
          {/* 5. Gunakan 'currentItems' untuk di-map */}
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.created_at}</td>
              <td>{item.age}</td>
              <td>{item.gender}</td>
              <td>{item.hypertension}</td>
              <td>{item.heart_disease}</td>
              <td>{item.bmi.toFixed(2)}</td>
              <td>{item.HbA1c_level}</td>
              <td>{item.blood_glucose_level}</td>
              <td>{item.result_prediction}</td>
              <td>{(item.result_probability * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 6. Tambahkan komponen Pagination di bawah tabel */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            {[...Array(totalPages).keys()].map(number => (
              <Pagination.Item 
                key={number + 1} 
                active={number + 1 === currentPage}
                onClick={() => setCurrentPage(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </>
  );
}

export default HistoryPage;