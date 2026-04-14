const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// DB CONNECTION — update user/password to match your MySQL credentials ****
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',       
  database: 'clinic_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to clinic_db');
});

// helper so we can use async/await with the callback-based driver
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}


//  PATIENTS

// GET all patients
app.get('/api/patients', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM Patient ORDER BY Name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single patient
app.get('/api/patients/:ssn', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM Patient WHERE SSN = ?', [req.params.ssn]);
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create patient
app.post('/api/patients', async (req, res) => {
  const { SSN, Name, DOB, Phone, Email } = req.body;
  if (!SSN || !Name || !DOB) return res.status(400).json({ error: 'SSN, Name, and DOB are required' });
  try {
    await query('INSERT INTO Patient (SSN, Name, DOB, Phone, Email) VALUES (?, ?, ?, ?, ?)',
      [SSN, Name, DOB, Phone || null, Email || null]);
    res.status(201).json({ message: 'Patient created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update patient
app.put('/api/patients/:ssn', async (req, res) => {
  const { Name, DOB, Phone, Email } = req.body;
  try {
    await query('UPDATE Patient SET Name=?, DOB=?, Phone=?, Email=? WHERE SSN=?',
      [Name, DOB, Phone || null, Email || null, req.params.ssn]);
    res.json({ message: 'Patient updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE patient
app.delete('/api/patients/:ssn', async (req, res) => {
  try {
    await query('DELETE FROM Patient WHERE SSN = ?', [req.params.ssn]);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  EMPLOYEES & DOCTORS

app.get('/api/employees', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM Employee ORDER BY Name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all doctors joined with Employee for name
app.get('/api/doctors', async (req, res) => {
  try {
    const rows = await query(
      `SELECT d.SSN, e.Name, d.Specialty, e.Phone, e.Email
      FROM Doctor d JOIN Employee e ON d.SSN = e.SSN
      ORDER BY e.Name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create employee + optional doctor record
app.post('/api/employees', async (req, res) => {
  const { SSN, Name, Role, Phone, Email, Specialty } = req.body;
  if (!SSN || !Name || !Role) return res.status(400).json({ error: 'SSN, Name, and Role are required' });
  try {
    await query('INSERT INTO Employee (SSN, Name, Role, Phone, Email) VALUES (?, ?, ?, ?, ?)',
      [SSN, Name, Role, Phone || null, Email || null]);
    if (Role === 'Doctor' && Specialty) {
      await query('INSERT INTO Doctor (SSN, Specialty) VALUES (?, ?)', [SSN, Specialty]);
    }
    res.status(201).json({ message: 'Employee created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
app.delete('/api/employees/:ssn', async (req, res) => {
  try {
    await query('DELETE FROM Employee WHERE SSN = ?', [req.params.ssn]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  APPOINTMENTS

app.get('/api/appointments', async (req, res) => {
  try {
    const rows = await query(
      `SELECT a.AppointmentID, a.AppDate, a.AppTime, p.Name AS PatientName, p.SSN AS PatientSSN
      FROM Appointment a JOIN Patient p ON a.PatientSSN = p.SSN
      ORDER BY a.AppDate, a.AppTime`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { PatientSSN, AppDate, AppTime } = req.body;
  if (!PatientSSN || !AppDate || !AppTime) return res.status(400).json({ error: 'All fields required' });
  try {
    const result = await query('INSERT INTO Appointment (PatientSSN, AppDate, AppTime) VALUES (?, ?, ?)',
      [PatientSSN, AppDate, AppTime]);
    res.status(201).json({ message: 'Appointment created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await query('DELETE FROM Appointment WHERE AppointmentID = ?', [req.params.id]);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  PRESCRIPTIONS

app.get('/api/prescriptions', async (req, res) => {
  try {
    const rows = await query(
      `SELECT pr.PrescriptionID, pr.MedicationName, pr.Dose, pr.Quantity, pr.PrescDate,
              p.Name AS PatientName, p.SSN AS PatientSSN,
              e.Name AS DoctorName, pr.DoctorSSN
      FROM Prescription pr
      JOIN Patient p ON pr.PatientSSN = p.SSN
      LEFT JOIN Employee e ON pr.DoctorSSN = e.SSN
      ORDER BY pr.PrescDate DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  const { PatientSSN, DoctorSSN, MedicationName, Dose, Quantity, PrescDate } = req.body;
  if (!PatientSSN || !MedicationName || !Dose || !Quantity || !PrescDate)
    return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = await query(
      'INSERT INTO Prescription (PatientSSN, DoctorSSN, MedicationName, Dose, Quantity, PrescDate) VALUES (?, ?, ?, ?, ?, ?)',
      [PatientSSN, DoctorSSN || null, MedicationName, Dose, Quantity, PrescDate]
    );
    res.status(201).json({ message: 'Prescription created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prescriptions/:id', async (req, res) => {
  try {
    await query('DELETE FROM Prescription WHERE PrescriptionID = ?', [req.params.id]);
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  TREATED BY

app.get('/api/treatedby', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.Name AS PatientName, tb.PatientSSN, e.Name AS DoctorName, tb.DoctorSSN
      FROM TreatedBy tb
      JOIN Patient p ON tb.PatientSSN = p.SSN
      JOIN Employee e ON tb.DoctorSSN = e.SSN
      ORDER BY p.Name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/treatedby', async (req, res) => {
  const { PatientSSN, DoctorSSN } = req.body;
  if (!PatientSSN || !DoctorSSN) return res.status(400).json({ error: 'Both SSNs required' });
  try {
    await query('INSERT INTO TreatedBy (PatientSSN, DoctorSSN) VALUES (?, ?)', [PatientSSN, DoctorSSN]);
    res.status(201).json({ message: 'Relationship added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/treatedby', async (req, res) => {
  const { PatientSSN, DoctorSSN } = req.body;
  try {
    await query('DELETE FROM TreatedBy WHERE PatientSSN = ? AND DoctorSSN = ?', [PatientSSN, DoctorSSN]);
    res.json({ message: 'Relationship removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  DASHBOARD STATS

app.get('/api/stats', async (req, res) => {
  try {
    const [[{ patients }]] = [await query('SELECT COUNT(*) AS patients FROM Patient')];
    const [[{ doctors }]] = [await query('SELECT COUNT(*) AS doctors FROM Doctor')];
    const [[{ appointments }]] = [await query('SELECT COUNT(*) AS appointments FROM Appointment')];
    const [[{ prescriptions }]] = [await query('SELECT COUNT(*) AS prescriptions FROM Prescription')];
    res.json({ patients, doctors, appointments, prescriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Clinic API running at http://localhost:${PORT}`));
