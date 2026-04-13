USE clinic_db;

-- Patient appointment history (all past and future appointments per patient)
SELECT p.Name AS PatientName, a.AppDate, a.AppTime
FROM Patient p
JOIN Appointment a ON p.SSN = a.PatientSSN
ORDER BY p.Name, a.AppDate;

-- Patient prescription list (uses the PatientPrescriptionHistory view)
SELECT PatientName, MedicationName, Dose, Quantity, DoctorName, PrescDate
FROM PatientPrescriptionHistory
ORDER BY PatientName, PrescDate;

-- Number of appointments per patient
SELECT p.Name AS PatientName, COUNT(a.AppointmentID) AS TotalAppointments
FROM Patient p
LEFT JOIN Appointment a ON p.SSN = a.PatientSSN
GROUP BY p.SSN, p.Name
ORDER BY TotalAppointments DESC;

-- Most prescribed medications across the clinic
SELECT MedicationName, COUNT(*) AS TimesPrescribed, SUM(Quantity) AS TotalQuantity
FROM Prescription
GROUP BY MedicationName
ORDER BY TimesPrescribed DESC;

-- Doctor workload report (uses the DoctorWorkload view)
SELECT DoctorName, Specialty, PatientCount, PrescriptionCount
FROM DoctorWorkload
ORDER BY PrescriptionCount DESC;

-- Patients with more than one prescribing doctor
SELECT p.Name AS PatientName, COUNT(DISTINCT pr.DoctorSSN) AS DoctorCount
FROM Patient p
JOIN Prescription pr ON p.SSN = pr.PatientSSN
GROUP BY p.SSN, p.Name
HAVING COUNT(DISTINCT pr.DoctorSSN) > 1;

-- Daily appointment count for the next 30 days
SELECT AppDate, COUNT(*) AS AppointmentsScheduled
FROM Appointment
WHERE AppDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
GROUP BY AppDate
ORDER BY AppDate;
