USE clinic_db;

-- insert a new patient
INSERT INTO Patient (SSN, Name, DOB, Phone, Email)
VALUES ('666666666', 'Frank Garcia', '1988-03-14', '4075550106', 'frank.g@email.com');

-- schedule (inserrt) an appointment for the new patient
INSERT INTO Appointment (PatientSSN, AppDate, AppTime)
VALUES ('666666666', '2026-05-01', '10:00:00');

-- insert new employee and promote them to doctor (ISA hierarchy requires both)
INSERT INTO Employee (SSN, Name, Role, Phone, Email)
VALUES ('100000006', 'Dr. Rachel Kim', 'Doctor', '4075559006', 'r.kim@clinic.com');
INSERT INTO Doctor (SSN, Specialty)
VALUES ('100000006', 'Dermatology');

-- update a patient's phone number
UPDATE Patient
SET Phone = '4075559999'
WHERE SSN = '111111111';

-- update an existing appointment
UPDATE Appointment
SET AppDate = '2026-04-25', AppTime = '13:30:00'
WHERE AppointmentID = 1;

-- update to increase prescription quantity for a refill
UPDATE Prescription
SET Quantity = Quantity + 30
WHERE PrescriptionID = 1;

-- delete an appointment
DELETE FROM Appointment
WHERE AppointmentID = 7;

-- delete a patient
-- (cascading delete will automatically remove their appointments, prescriptions, and treatedby rows)
DELETE FROM Patient
WHERE SSN = '555555555';
