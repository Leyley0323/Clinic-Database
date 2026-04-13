USE clinic_db;

-- Search patients by name (partial match)
SELECT SSN, Name, DOB, Phone, Email
FROM Patient
WHERE Name LIKE '%Lee%';

-- Filter appointments within a specific date range
SELECT AppointmentID, PatientSSN, AppDate, AppTime
FROM Appointment
WHERE AppDate BETWEEN '2026-04-20' AND '2026-04-25'
ORDER BY AppDate, AppTime;

-- Search all patients treated by a specific doctor
SELECT p.SSN, p.Name, p.Phone
FROM Patient p
JOIN TreatedBy tb ON p.SSN = tb.PatientSSN
WHERE tb.DoctorSSN = '100000001';

-- Search all doctors of a given specialty
SELECT d.SSN, e.Name, d.Specialty
FROM Doctor d
JOIN Employee e ON d.SSN = e.SSN
WHERE d.Specialty = 'Cardiology';

-- Search prescriptions for a specific medication
SELECT pr.PrescriptionID, p.Name AS PatientName, pr.Dose, pr.Quantity, pr.PrescDate
FROM Prescription pr
JOIN Patient p ON pr.PatientSSN = p.SSN
WHERE pr.MedicationName = 'Amoxicillin';

-- Search all employees who are NOT doctors
SELECT SSN, Name, Role
FROM Employee
WHERE SSN NOT IN (SELECT SSN FROM Doctor);
