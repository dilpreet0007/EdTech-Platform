import React, { useEffect, useState } from 'react';
import { apiConnector } from '../services/apiConnector'; // Adjust path if needed
import { endpoints } from '../services/apis'; // Adjust path if needed
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numRecords, setNumRecords] = useState('all'); // State to hold the number of records to download
  const [startDate, setStartDate] = useState(''); // Start date for filtering
  const [endDate, setEndDate] = useState(''); // End date for filtering

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiConnector('GET', endpoints.GET_ALL_USERS_API);
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (err) {
        setError('Could not fetch users');
        console.error(err);
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filterUsersByDate = (users) => {
    if (!startDate && !endDate) return users;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return users.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return (!startDate || createdAt >= start) && (!endDate || createdAt <= end);
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('User Report', 14, 10);

    const numToDownload = numRecords === 'all' ? filterUsersByDate(users) : filterUsersByDate(users).slice(0, parseInt(numRecords));

    doc.autoTable({
      head: [['ID', 'Name', 'Email', 'Account Type', 'Created At']],
      body: numToDownload.map(user => [
        user._id,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.accountType,
        new Date(user.createdAt).toLocaleString(),
      ]),
      startY: 20,
    });

    doc.save('user-report.pdf');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>User Report</h1>
      {users.length === 0 ? (
        <p style={styles.noUsers}>No users found.</p>
      ) : (
        <div>
          {/* Download Button */}
          <button style={styles.downloadButton} onClick={downloadPDF}>
            Download PDF
          </button>
          
          <div style={styles.selectContainer}>
            <label style={styles.label}>Enter number of records to download: </label>
            <input
              type="number"
              style={styles.input}
              value={numRecords === 'all' ? '' : numRecords}
              onChange={(e) => setNumRecords(e.target.value)}
              min="1"
              max={users.length}
              placeholder="Enter number of records"
            />
            <label style={styles.label}>or choose all</label>
            <input
              type="checkbox"
              checked={numRecords === 'all'}
              onChange={() => setNumRecords(numRecords === 'all' ? '1' : 'all')}
            />
            <span>All</span>
          </div>

          {/* Date Range Filter */}
          <div style={styles.selectContainer}>
            <label style={styles.label}>Select Start Date: </label>
            <input
              type="date"
              style={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label style={styles.label}>Select End Date: </label>
            <input
              type="date"
              style={styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableCell}>ID</th>
                <th style={styles.tableCell}>Name</th>
                <th style={styles.tableCell}>Email</th>
                <th style={styles.tableCell}>Account Type</th>
                <th style={styles.tableCell}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filterUsersByDate(users).map(user => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{user._id}</td>
                  <td style={styles.tableCell}>{`${user.firstName} ${user.lastName}`}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>{user.accountType}</td>
                  <td style={styles.tableCell}>{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// CSS-in-JS styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
    fontSize: '2.2em',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#555',
  },
  error: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: 'red',
  },
  noUsers: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#666',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #ddd',
  },
  downloadButton: {
    marginBottom: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  selectContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '5px',
    marginRight: '10px',
    width: '160px',
    textAlign: 'center',
  },
  label: {
    marginRight: '10px',
  },
};

export default Report;
