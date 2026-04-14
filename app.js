//Clinic Management System frontend logic

const API = 'http://localhost:3000/api';

//  NAVIGATION
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('page-title');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;

    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    link.classList.add('active');
    document.getElementById(`section-${target}`).classList.add('active');
    pageTitle.textContent = link.textContent.trim();

    // load data when section becomes active
    const loaders = {
      dashboard:     loadDashboard,
      patients:      loadPatients,
      employees:     loadEmployees,
      appointments:  loadAppointments,
      prescriptions: loadPrescriptions,
      treatedby:     loadTreatedBy,
    };
    if (loaders[target]) loaders[target]();
  });
});

//  TOAST
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('hidden'), 3000);
}

//  API HELPER
async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

//  CONNECTION CHECK
async function checkConnection() {
  const badge = document.getElementById('connection-status');
  try {
    await apiFetch('/stats');
    badge.textContent = 'Connected';
    badge.className = 'status-badge connected';
  } catch {
    badge.textContent = 'Offline';
    badge.className = 'status-badge error';
  }
}

//  MODAL HELPERS
function openModal(id) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');

  // pre-populate dropdowns when opening
  if (id === 'modal-appointment') populatePatientDropdowns(['appt-patient']);
  if (id === 'modal-prescription') {
    populatePatientDropdowns(['presc-patient']);
    populateDoctorDropdowns(['presc-doctor']);
  }
  if (id === 'modal-treatedby') {
    populatePatientDropdowns(['tb-patient']);
    populateDoctorDropdowns(['tb-doctor']);
  }
}

function closeAllModals() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  // reset edit state
  document.getElementById('patient-edit-ssn').value = '';
  document.getElementById('modal-patient-title').textContent = 'Add Patient';
  document.getElementById('patient-ssn').disabled = false;
}

//  DROPDOWN POPULATION
async function populatePatientDropdowns(ids) {
  try {
    const patients = await apiFetch('/patients');
    ids.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = patients.map(p =>
        `<option value="${p.SSN}">${p.Name} (${p.SSN})</option>`
      ).join('');
    });
  } catch (err) {
    console.error('Could not load patients for dropdown:', err);
  }
}

async function populateDoctorDropdowns(ids) {
  try {
    const doctors = await apiFetch('/doctors');
    ids.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const noneOpt = id === 'presc-doctor' ? '<option value="">— None —</option>' : '';
      sel.innerHTML = noneOpt + doctors.map(d =>
        `<option value="${d.SSN}">${d.Name} — ${d.Specialty}</option>`
      ).join('');
    });
  } catch (err) {
    console.error('Could not load doctors for dropdown:', err);
  }
}

//  DASHBOARD
async function loadDashboard() {
  try {
    const stats = await apiFetch('/stats');
    document.getElementById('stat-patients').textContent     = stats.patients;
    document.getElementById('stat-doctors').textContent      = stats.doctors;
    document.getElementById('stat-appointments').textContent = stats.appointments;
    document.getElementById('stat-prescriptions').textContent= stats.prescriptions;

    // upcoming appointments
    const appts = await apiFetch('/appointments');
    const apptDiv = document.getElementById('dash-appointments');
    if (!appts.length) { apptDiv.innerHTML = '<div class="dash-item">No appointments</div>'; }
    else {
      apptDiv.innerHTML = appts.slice(0, 6).map(a =>
        `<div class="dash-item">
          <span class="dash-item-name">${a.PatientName}</span>
          <span class="dash-item-meta">${formatDate(a.AppDate)} ${formatTime(a.AppTime)}</span>
        </div>`
      ).join('');
    }

    // recent prescriptions
    const prescs = await apiFetch('/prescriptions');
    const prescDiv = document.getElementById('dash-prescriptions');
    if (!prescs.length) { prescDiv.innerHTML = '<div class="dash-item">No prescriptions</div>'; }
    else {
      prescDiv.innerHTML = prescs.slice(0, 6).map(p =>
        `<div class="dash-item">
          <span class="dash-item-name">${p.PatientName} — ${p.MedicationName}</span>
          <span class="dash-item-meta">${formatDate(p.PrescDate)}</span>
        </div>`
      ).join('');
    }
  } catch (err) {
    showToast('Failed to load dashboard: ' + err.message, 'error');
  }
}

//  PATIENTS
async function loadPatients() {
  try {
    const rows = await apiFetch('/patients');
    const tbody = document.getElementById('tbody-patients');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No patients found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td>${p.SSN}</td>
        <td>${p.Name}</td>
        <td>${formatDate(p.DOB)}</td>
        <td>${p.Phone || '—'}</td>
        <td>${p.Email || '—'}</td>
        <td>
          <button class="btn btn-edit" onclick="editPatient('${p.SSN}','${escHtml(p.Name)}','${p.DOB?.substring(0,10)}','${p.Phone||''}','${p.Email||''}')">Edit</button>
          <button class="btn btn-danger" onclick="deletePatient('${p.SSN}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load patients: ' + err.message, 'error');
  }
}

function editPatient(ssn, name, dob, phone, email) {
  document.getElementById('patient-edit-ssn').value  = ssn;
  document.getElementById('modal-patient-title').textContent = 'Edit Patient';
  document.getElementById('patient-ssn').value       = ssn;
  document.getElementById('patient-ssn').disabled    = true;
  document.getElementById('patient-name').value      = name;
  document.getElementById('patient-dob').value       = dob;
  document.getElementById('patient-phone').value     = phone;
  document.getElementById('patient-email').value     = email;
  openModal('modal-patient');
}

async function savePatient() {
  const editSSN = document.getElementById('patient-edit-ssn').value;
  const SSN     = document.getElementById('patient-ssn').value.trim();
  const Name    = document.getElementById('patient-name').value.trim();
  const DOB     = document.getElementById('patient-dob').value;
  const Phone   = document.getElementById('patient-phone').value.trim();
  const Email   = document.getElementById('patient-email').value.trim();

  if (!SSN || !Name || !DOB) { showToast('SSN, Name, and DOB are required', 'error'); return; }
  if (SSN.length !== 9 || !/^\d+$/.test(SSN)) { showToast('SSN must be exactly 9 digits', 'error'); return; }

  try {
    if (editSSN) {
      await apiFetch(`/patients/${editSSN}`, { method: 'PUT', body: JSON.stringify({ Name, DOB, Phone, Email }) });
      showToast('Patient updated');
    } else {
      await apiFetch('/patients', { method: 'POST', body: JSON.stringify({ SSN, Name, DOB, Phone, Email }) });
      showToast('Patient added');
    }
    closeAllModals();
    loadPatients();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deletePatient(ssn) {
  if (!confirm(`Delete patient ${ssn}? This will also remove their appointments, prescriptions, and relationships.`)) return;
  try {
    await apiFetch(`/patients/${ssn}`, { method: 'DELETE' });
    showToast('Patient deleted');
    loadPatients();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

//  EMPLOYEES
function toggleSpecialty() {
  const role = document.getElementById('emp-role').value;
  document.getElementById('specialty-field').style.display = role === 'Doctor' ? 'flex' : 'none';
}

async function loadEmployees() {
  try {
    const rows = await apiFetch('/employees');
    const tbody = document.getElementById('tbody-employees');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No employees found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(e => `
      <tr>
        <td>${e.SSN}</td>
        <td>${e.Name}</td>
        <td>${e.Role}</td>
        <td>${e.Phone || '—'}</td>
        <td>${e.Email || '—'}</td>
        <td><button class="btn btn-danger" onclick="deleteEmployee('${e.SSN}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load employees: ' + err.message, 'error');
  }
}

async function saveEmployee() {
  const SSN       = document.getElementById('emp-ssn').value.trim();
  const Name      = document.getElementById('emp-name').value.trim();
  const Role      = document.getElementById('emp-role').value;
  const Phone     = document.getElementById('emp-phone').value.trim();
  const Email     = document.getElementById('emp-email').value.trim();
  const Specialty = document.getElementById('emp-specialty').value.trim();

  if (!SSN || !Name || !Role) { showToast('SSN, Name, and Role are required', 'error'); return; }
  if (SSN.length !== 9 || !/^\d+$/.test(SSN)) { showToast('SSN must be 9 digits', 'error'); return; }
  if (Role === 'Doctor' && !Specialty) { showToast('Specialty required for doctors', 'error'); return; }

  try {
    await apiFetch('/employees', { method: 'POST', body: JSON.stringify({ SSN, Name, Role, Phone, Email, Specialty }) });
    showToast('Employee added');
    closeAllModals();
    loadEmployees();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEmployee(ssn) {
  if (!confirm('Delete this employee?')) return;
  try {
    await apiFetch(`/employees/${ssn}`, { method: 'DELETE' });
    showToast('Employee deleted');
    loadEmployees();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

//  APPOINTMENTS
async function loadAppointments() {
  try {
    const rows = await apiFetch('/appointments');
    const tbody = document.getElementById('tbody-appointments');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No appointments found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(a => `
      <tr>
        <td>${a.AppointmentID}</td>
        <td>${a.PatientName}</td>
        <td>${formatDate(a.AppDate)}</td>
        <td>${formatTime(a.AppTime)}</td>
        <td><button class="btn btn-danger" onclick="deleteAppointment(${a.AppointmentID})">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load appointments: ' + err.message, 'error');
  }
}

async function saveAppointment() {
  const PatientSSN = document.getElementById('appt-patient').value;
  const AppDate    = document.getElementById('appt-date').value;
  const AppTime    = document.getElementById('appt-time').value;

  if (!PatientSSN || !AppDate || !AppTime) { showToast('All fields required', 'error'); return; }

  try {
    await apiFetch('/appointments', { method: 'POST', body: JSON.stringify({ PatientSSN, AppDate, AppTime }) });
    showToast('Appointment scheduled');
    closeAllModals();
    loadAppointments();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteAppointment(id) {
  if (!confirm('Cancel this appointment?')) return;
  try {
    await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
    showToast('Appointment removed');
    loadAppointments();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

//  PRESCRIPTIONS
async function loadPrescriptions() {
  try {
    const rows = await apiFetch('/prescriptions');
    const tbody = document.getElementById('tbody-prescriptions');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No prescriptions found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td>${p.PrescriptionID}</td>
        <td>${p.PatientName}</td>
        <td>${p.DoctorName || '—'}</td>
        <td>${p.MedicationName}</td>
        <td>${p.Dose}</td>
        <td>${p.Quantity}</td>
        <td>${formatDate(p.PrescDate)}</td>
        <td><button class="btn btn-danger" onclick="deletePrescription(${p.PrescriptionID})">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load prescriptions: ' + err.message, 'error');
  }
}

async function savePrescription() {
  const PatientSSN     = document.getElementById('presc-patient').value;
  const DoctorSSN      = document.getElementById('presc-doctor').value;
  const MedicationName = document.getElementById('presc-med').value.trim();
  const Dose           = document.getElementById('presc-dose').value.trim();
  const Quantity       = parseInt(document.getElementById('presc-qty').value);
  const PrescDate      = document.getElementById('presc-date').value;

  if (!PatientSSN || !MedicationName || !Dose || !Quantity || !PrescDate) {
    showToast('Please fill all required fields', 'error'); return;
  }
  if (Quantity < 1) { showToast('Quantity must be at least 1', 'error'); return; }

  try {
    await apiFetch('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({ PatientSSN, DoctorSSN: DoctorSSN || null, MedicationName, Dose, Quantity, PrescDate })
    });
    showToast('Prescription added');
    closeAllModals();
    loadPrescriptions();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deletePrescription(id) {
  if (!confirm('Delete this prescription?')) return;
  try {
    await apiFetch(`/prescriptions/${id}`, { method: 'DELETE' });
    showToast('Prescription deleted');
    loadPrescriptions();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

//  TREATED BY
async function loadTreatedBy() {
  try {
    const rows = await apiFetch('/treatedby');
    const tbody = document.getElementById('tbody-treatedby');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No relationships found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.PatientName}</td>
        <td>${r.PatientSSN}</td>
        <td>${r.DoctorName}</td>
        <td>${r.DoctorSSN}</td>
        <td>
          <button class="btn btn-danger"
            onclick="deleteTreatedBy('${r.PatientSSN}','${r.DoctorSSN}')">Remove</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load relationships: ' + err.message, 'error');
  }
}

async function saveTreatedBy() {
  const PatientSSN = document.getElementById('tb-patient').value;
  const DoctorSSN  = document.getElementById('tb-doctor').value;
  if (!PatientSSN || !DoctorSSN) { showToast('Select both a patient and a doctor', 'error'); return; }
  try {
    await apiFetch('/treatedby', { method: 'POST', body: JSON.stringify({ PatientSSN, DoctorSSN }) });
    showToast('Relationship added');
    closeAllModals();
    loadTreatedBy();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTreatedBy(PatientSSN, DoctorSSN) {
  if (!confirm('Remove this patient–doctor relationship?')) return;
  try {
    await apiFetch('/treatedby', { method: 'DELETE', body: JSON.stringify({ PatientSSN, DoctorSSN }) });
    showToast('Relationship removed');
    loadTreatedBy();
  } catch (err) {
    showToast(err.message, 'error');
  }
}


function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatTime(str) {
  if (!str) return '—';
  const [h, m] = str.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function escHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

checkConnection();
loadDashboard();
toggleSpecialty(); // hide specialty field initially if non-doctor role
