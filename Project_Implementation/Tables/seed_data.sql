USE clinic_db; -- make sure to set use to clinic_db, schema.sql should be ran before this to create clinic_db

INSERT INTO Patient (SSN, Name, DOB, Phone, Email) VALUES
('111111111', 'Alice Johnson',   '1985-04-12', '4075550101', 'alice.j@email.com'),
('222222222', 'Brian Lee',       '1992-09-30', '4075550102', 'brian.lee@email.com'),
('333333333', 'Carla Mendez',    '1978-01-22', '4075550103', 'carla.m@email.com'),
('444444444', 'David Kim',       '2001-11-05', '4075550104', 'dkim@email.com'),
('555555555', 'Emily Chen',      '1995-07-18', '4075550105', 'emily.c@email.com');

INSERT INTO Employee (SSN, Name, Role, Phone, Email) VALUES
('100000001', 'Dr. Sarah Patel',  'Doctor',       '4075559001', 's.patel@clinic.com'),
('100000002', 'Dr. James Wright', 'Doctor',       '4075559002', 'j.wright@clinic.com'),
('100000003', 'Dr. Maria Lopez',  'Doctor',       '4075559003', 'm.lopez@clinic.com'),
('100000004', 'Nancy Reed',       'Nurse',        '4075559004', 'n.reed@clinic.com'),
('100000005', 'Tom Brooks',       'Receptionist', '4075559005', 't.brooks@clinic.com');

INSERT INTO Doctor (SSN, Specialty) VALUES
('100000001', 'Family Medicine'),
('100000002', 'Cardiology'),
('100000003', 'Pediatrics');

INSERT INTO TreatedBy (PatientSSN, DoctorSSN) VALUES
('111111111', '100000001'),
('111111111', '100000002'),
('222222222', '100000001'),
('333333333', '100000002'),
('444444444', '100000003'),
('555555555', '100000001');

INSERT INTO Appointment (PatientSSN, AppDate, AppTime) VALUES
('111111111', '2026-04-20', '09:00:00'),
('111111111', '2026-05-15', '10:30:00'),
('222222222', '2026-04-21', '11:00:00'),
('333333333', '2026-04-22', '14:00:00'),
('444444444', '2026-04-23', '09:30:00'),
('555555555', '2026-04-24', '15:00:00'),
('222222222', '2026-05-10', '13:00:00');

INSERT INTO Prescription (PatientSSN, DoctorSSN, MedicationName, Dose, Quantity, PrescDate) VALUES
('111111111', '100000001', 'Amoxicillin',   '500mg', 30, '2026-04-20'),
('111111111', '100000002', 'Lisinopril',    '10mg',  90, '2026-04-20'),
('222222222', '100000001', 'Ibuprofen',     '200mg', 60, '2026-04-21'),
('333333333', '100000002', 'Metoprolol',    '25mg',  90, '2026-04-22'),
('444444444', '100000003', 'Amoxicillin',   '250mg', 20, '2026-04-23'),
('555555555', '100000001', 'Azithromycin',  '500mg',  6, '2026-04-24');
