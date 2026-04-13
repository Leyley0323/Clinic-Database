CREATE DATABASE IF NOT EXISTS clinic_db;
USE clinic_db;

-- drop all tables first to make sure there is a clean starting place
DROP TABLE IF EXISTS Prescription;
DROP TABLE IF EXISTS TreatedBy;
DROP TABLE IF EXISTS Appointment;
DROP TABLE IF EXISTS Doctor;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Patient;

CREATE TABLE Patient (
    SSN         CHAR(9)       NOT NULL,
    Name        VARCHAR(100)  NOT NULL,
    DOB         DATE          NOT NULL,
    Phone       CHAR(10),
    Email       VARCHAR(100),
    CONSTRAINT pk_patient PRIMARY KEY (SSN)
);

CREATE TABLE Employee (
    SSN         CHAR(9)       NOT NULL,
    Name        VARCHAR(100)  NOT NULL,
    Role        VARCHAR(50)   NOT NULL,
    Phone       CHAR(10),
    Email       VARCHAR(100),
    CONSTRAINT pk_employee PRIMARY KEY (SSN)
);

-- Doctor is subclass of Employee (ISA Hierarcy)
-- Used SSN as both a PK and FK to make sure a doctor exists as an Employee first
CREATE TABLE Doctor (
    SSN         CHAR(9)       NOT NULL,
    Specialty   VARCHAR(100)  NOT NULL,
    CONSTRAINT pk_doctor PRIMARY KEY (SSN),
    CONSTRAINT fk_doctor_employee FOREIGN KEY (SSN)
        REFERENCES Employee(SSN)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Appointment (
    AppointmentID   INT           NOT NULL AUTO_INCREMENT,
    PatientSSN      CHAR(9)       NOT NULL,
    AppDate         DATE          NOT NULL,
    AppTime         TIME          NOT NULL,
    CONSTRAINT pk_appointment PRIMARY KEY (AppointmentID),
    CONSTRAINT fk_appointment_patient FOREIGN KEY (PatientSSN)
        REFERENCES Patient(SSN)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Junction table for a m->m relationship
-- Cascade delete / update on both FKs, this ensures removing or updating
-- either entity only affects the relationship row, not the patient or doctor itself 
CREATE TABLE TreatedBy (
    PatientSSN  CHAR(9)   NOT NULL,
    DoctorSSN   CHAR(9)   NOT NULL,
    CONSTRAINT pk_treatedby PRIMARY KEY (PatientSSN, DoctorSSN),
    CONSTRAINT fk_treatedby_patient FOREIGN KEY (PatientSSN)
        REFERENCES Patient(SSN)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_treatedby_doctor FOREIGN KEY (DoctorSSN)
        REFERENCES Doctor(SSN)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- patient uses cascading delete because prescriptions belong to the patient, so they should be removed with the patient
-- doctor uses SET NULL to preserve prescription history if a doctor is removed
-- The CHECK constraint ensures that the prescription quantity is a postive value
CREATE TABLE Prescription (
    PrescriptionID  INT           NOT NULL AUTO_INCREMENT,
    PatientSSN      CHAR(9)       NOT NULL,
    DoctorSSN       CHAR(9),
    MedicationName  VARCHAR(100)  NOT NULL,
    Dose            VARCHAR(50)   NOT NULL,
    Quantity        INT           NOT NULL,
    PrescDate       DATE          NOT NULL,
    CONSTRAINT pk_prescription PRIMARY KEY (PrescriptionID),
    CONSTRAINT fk_prescription_patient FOREIGN KEY (PatientSSN)
        REFERENCES Patient(SSN)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (DoctorSSN)
        REFERENCES Doctor(SSN)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_prescription_quantity CHECK (Quantity > 0)
);
