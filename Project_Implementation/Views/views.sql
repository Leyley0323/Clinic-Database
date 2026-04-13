USE clinic_db;

DROP VIEW IF EXISTS PatientPrescriptionHistory;
DROP VIEW IF EXISTS DoctorWorkload;
DROP VIEW IF EXISTS UpcomingAppointments;
DROP VIEW IF EXISTS PatientCareSummary;

-- View 1 = Full prescription history with patient and prescribing doctor names
CREATE VIEW PatientPrescriptionHistory AS
SELECT
    pr.PrescriptionID,
    p.SSN              AS PatientSSN,
    p.Name             AS PatientName,
    e.Name             AS DoctorName,
    d.Specialty        AS DoctorSpecialty,
    pr.MedicationName,
    pr.Dose,
    pr.Quantity,
    pr.PrescDate
FROM Prescription pr
JOIN Patient  p ON pr.PatientSSN = p.SSN
LEFT JOIN Doctor   d ON pr.DoctorSSN  = d.SSN
LEFT JOIN Employee e ON d.SSN         = e.SSN;

-- View 2 = Workload per doctor that shows how many patients they treat and prescriptions written
CREATE VIEW DoctorWorkload AS
SELECT
    d.SSN              AS DoctorSSN,
    e.Name             AS DoctorName,
    d.Specialty,
    COUNT(DISTINCT tb.PatientSSN) AS PatientCount,
    COUNT(DISTINCT pr.PrescriptionID) AS PrescriptionCount
FROM Doctor d
JOIN Employee e ON d.SSN = e.SSN
LEFT JOIN TreatedBy    tb ON d.SSN = tb.DoctorSSN
LEFT JOIN Prescription pr ON d.SSN = pr.DoctorSSN
GROUP BY d.SSN, e.Name, d.Specialty;

-- View 3 = All upcoming appointments with patient contact info
CREATE VIEW UpcomingAppointments AS
SELECT
    a.AppointmentID,
    a.AppDate,
    a.AppTime,
    p.SSN    AS PatientSSN,
    p.Name   AS PatientName,
    p.Phone  AS PatientPhone
FROM Appointment a
JOIN Patient p ON a.PatientSSN = p.SSN
WHERE a.AppDate >= CURDATE()
ORDER BY a.AppDate, a.AppTime;

-- View 4 = Perpatient summary showing total doctors, appointments, and prescriptions
CREATE VIEW PatientCareSummary AS
SELECT
    p.SSN              AS PatientSSN,
    p.Name             AS PatientName,
    COUNT(DISTINCT tb.DoctorSSN)        AS DoctorCount,
    COUNT(DISTINCT a.AppointmentID)     AS AppointmentCount,
    COUNT(DISTINCT pr.PrescriptionID)   AS PrescriptionCount
FROM Patient p
LEFT JOIN TreatedBy    tb ON p.SSN = tb.PatientSSN
LEFT JOIN Appointment  a  ON p.SSN = a.PatientSSN
LEFT JOIN Prescription pr ON p.SSN = pr.PatientSSN
GROUP BY p.SSN, p.Name;
