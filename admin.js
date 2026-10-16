/**
 * ============================================================
 * cherry — ADMIN PORTAL JAVASCRIPT
 * Frontend-only demo admin gate & reservation management
 * Data Storage: Browser localStorage (cherry_reservations)
 * ============================================================
 */

let allReservations = [];
let activeFilter = 'all';
let searchQuery = '';

// Single source of admin profile info (loaded from data/admin.json)
let adminProfile = {
  name: "Admin",
  email: "admin@example.com"
};

/* ──────────────────────────────────────────────────────────
   1. BOOT & ADMIN PROFILE LOADING
   ────────────────────────────────────────────────────────── */
async function loadAdminProfile() {
  try {
    const res = await fetch('data/admin.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.email) {
        adminProfile = data;
      }
    }
  } catch (err) {
    console.info('[Admin Gate] Using fallback profile configuration.');
  }
}

async function bootAdmin() {
  await loadAdminProfile();
  initAdminGate();
  initAdminDashboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
  bootAdmin();
}

/* ──────────────────────────────────────────────────────────
   2. FRONTEND DEMO ACCESS GATE
   ────────────────────────────────────────────────────────── */
function initAdminGate() {
  const loginSection = document.getElementById('admin-login-section');
  const dashSection  = document.getElementById('admin-dashboard-section');
  const loginForm    = document.getElementById('admin-login-form');
  const logoutBtn    = document.getElementById('admin-logout-btn');
  const emailDisplay = document.getElementById('logged-admin-email');

  function showDashboard() {
    if (emailDisplay) {
      emailDisplay.textContent = adminProfile.email;
    }
    if (loginSection) {
      loginSection.hidden = true;
      loginSection.style.display = 'none';
    }
    if (dashSection) {
      dashSection.hidden = false;
      dashSection.style.display = 'block';
    }
    loadReservations();
  }

  function showLogin() {
    if (loginSection) {
      loginSection.hidden = false;
      loginSection.style.display = 'flex';
    }
    if (dashSection) {
      dashSection.hidden = true;
      dashSection.style.display = 'none';
    }
  }

  // Check existing session
  const activeSession = sessionStorage.getItem('cherry_admin_session');
  if (activeSession === 'active') {
    showDashboard();
  } else {
    showLogin();
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('admin-email');
      const passInput  = document.getElementById('admin-password');
      const submitBtn  = document.getElementById('admin-login-submit');
      const btnText    = submitBtn ? submitBtn.querySelector('.btn-text') : null;

      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const pass  = passInput  ? passInput.value.trim() : '';

      // Clear previous error
      const existingErr = loginForm.querySelector('.form-error');
      if (existingErr) existingErr.remove();

      if (!email || !pass) {
        showLoginError('Please enter both admin email and password.');
        return;
      }

      // Friendly demo access check: verify against admin.json configuration
      const configuredEmail = (adminProfile.email || 'admin@example.com').toLowerCase();
      if (email !== configuredEmail) {
        showLoginError(`Access Denied. Demo administrator email is ${configuredEmail}`);
        return;
      }

      if (btnText) btnText.textContent = 'Verifying…';
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(() => {
        sessionStorage.setItem('cherry_admin_session', 'active');
        if (btnText) btnText.textContent = 'Log In to Portal';
        if (submitBtn) submitBtn.disabled = false;
        showDashboard();
        showToast(`Welcome back, ${adminProfile.name}!`, 'success');
      }, 350);
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cherry_admin_session');
      if (loginForm) loginForm.reset();
      showLogin();
      showToast('Logged out of Admin Portal.', 'info');
    });
  }
}

function showLoginError(msg) {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;
  const existingErr = loginForm.querySelector('.form-error');
  if (existingErr) existingErr.remove();

  const errEl = document.createElement('div');
  errEl.className = 'form-error';
  errEl.setAttribute('role', 'alert');
  errEl.textContent = msg;
  loginForm.appendChild(errEl);
}

/* ──────────────────────────────────────────────────────────
   3. RESERVATION MANAGEMENT & DASHBOARD CONTROLS
   ────────────────────────────────────────────────────────── */
function initAdminDashboard() {
  // Filter tabs
  const tabs = document.querySelectorAll('.admin-filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      renderTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  // Export Reservations button
  const exportBtn = document.getElementById('admin-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReservations);
  }

  // Import Reservations file input
  const importInput = document.getElementById('admin-import-file');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importReservations(file);
        e.target.value = ''; // reset input
      }
    });
  }
}

/* ──────────────────────────────────────────────────────────
   4. DATA RETRIEVAL (LOCALSTORAGE ONLY)
   ────────────────────────────────────────────────────────── */
function loadReservations() {
  try {
    const raw = localStorage.getItem('cherry_reservations');
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      allReservations = parsed.map((item, idx) => ({
        id: item.reservationId || item.id || `res_${idx}`,
        ...item
      }));
    } else {
      allReservations = [];
    }
  } catch (err) {
    console.warn('Error reading cherry_reservations from localStorage:', err);
    allReservations = [];
  }

  // Sort newest first
  allReservations.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  updateStats();
  renderTable();
}

function updateStats() {
  const totalEl     = document.getElementById('stat-total');
  const pendingEl   = document.getElementById('stat-pending');
  const confirmedEl = document.getElementById('stat-confirmed');
  const guestsEl    = document.getElementById('stat-guests');

  const total     = allReservations.length;
  const pending   = allReservations.filter(r => (r.status || 'pending').toLowerCase() === 'pending').length;
  const confirmed = allReservations.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;
  const guests    = allReservations.reduce((sum, r) => sum + (parseInt(r.guests, 10) || 2), 0);

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (confirmedEl) confirmedEl.textContent = confirmed;
  if (guestsEl) guestsEl.textContent = guests;
}

function renderTable() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  const filtered = allReservations.filter(res => {
    // Filter status
    const resStatus = (res.status || 'pending').toLowerCase();
    if (activeFilter !== 'all' && resStatus !== activeFilter.toLowerCase()) return false;

    // Filter search
    if (searchQuery) {
      const name  = (res.customerName || res.name || '').toLowerCase();
      const email = (res.email || '').toLowerCase();
      const phone = (res.phone || '').toLowerCase();
      if (!name.includes(searchQuery) && !email.includes(searchQuery) && !phone.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 48px; color: var(--warm-gray);">
          No reservations found matching your criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(res => {
    const rawStatus = res.status || 'pending';
    const statusLower = rawStatus.toLowerCase();
    const statusClass = `status--${statusLower}`;
    const timeFormatted = formatTime(res.time);

    const guestName = res.customerName || res.name || 'Guest';
    const notesText = res.specialRequest || res.notes || '';

    return `
      <tr data-id="${escapeHtml(res.id)}">
        <td>
          <div style="font-weight: 600; color: var(--bark);">${escapeHtml(guestName)}</div>
          <div style="font-size: 12px; color: var(--warm-gray);">${escapeHtml(res.email || '')}</div>
          ${res.phone ? `<div style="font-size: 12px; color: var(--coffee-mid);">${escapeHtml(res.phone)}</div>` : ''}
          ${res.reservationId ? `<div style="font-size: 11px; color: var(--coffee); font-family: monospace;">ID: ${escapeHtml(res.reservationId)}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(res.date || 'TBD')}</div>
          <div style="font-size: 12px; color: var(--coffee-mid);">${timeFormatted}</div>
        </td>
        <td style="font-weight: 600; text-align: center;">
          ${res.guests || 2}
        </td>
        <td style="max-width: 220px; font-size: 13px; color: var(--coffee-mid);">
          ${notesText ? escapeHtml(notesText) : '<span style="color:#A08070; font-style:italic;">None</span>'}
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor;"></span>
            ${escapeHtml(rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1))}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            ${statusLower !== 'confirmed' ? `<button type="button" class="btn-action btn-action--approve" onclick="updateBookingStatus('${escapeHtml(res.id)}', 'confirmed')">Confirm</button>` : ''}
            ${statusLower !== 'cancelled' ? `<button type="button" class="btn-action btn-action--cancel" onclick="updateBookingStatus('${escapeHtml(res.id)}', 'cancelled')">Cancel</button>` : ''}
            <button type="button" class="btn-action btn-action--delete" onclick="deleteBooking('${escapeHtml(res.id)}')">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ──────────────────────────────────────────────────────────
   5. ACTIONS (CONFIRM, CANCEL, DELETE) — LOCALSTORAGE ONLY
   ────────────────────────────────────────────────────────── */
window.updateBookingStatus = function(id, newStatus) {
  const item = allReservations.find(r => r.id === id);
  const nowIso = new Date().toISOString();
  if (item) {
    item.status = newStatus;
    item.updatedAt = nowIso;
  }

  saveToLocalStorage();
  updateStats();
  renderTable();

  const formattedName = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
  showToast(`Reservation marked as ${formattedName}.`, 'success');
};

window.deleteBooking = function(id) {
  if (!confirm('Are you sure you want to delete this reservation from local storage?')) return;

  allReservations = allReservations.filter(r => r.id !== id);
  saveToLocalStorage();
  updateStats();
  renderTable();

  showToast('Reservation deleted from local storage.', 'info');
};

function saveToLocalStorage() {
  try {
    localStorage.setItem('cherry_reservations', JSON.stringify(allReservations));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
    showToast('Failed to save to browser storage.', 'error');
  }
}

/* ──────────────────────────────────────────────────────────
   6. LOCAL BACKUP SYSTEM (EXPORT / IMPORT JSON)
   ────────────────────────────────────────────────────────── */
function exportReservations() {
  if (allReservations.length === 0) {
    showToast('No reservations to export.', 'info');
    return;
  }

  try {
    const dataStr = JSON.stringify(allReservations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'cherry-reservations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Reservations exported to cherry-reservations.json ✓', 'success');
  } catch (err) {
    console.error('Export error:', err);
    showToast('Failed to export reservations.', 'error');
  }
}

function importReservations(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!Array.isArray(parsed)) {
        showToast('Invalid backup file. JSON must contain an array of reservations.', 'error');
        return;
      }

      // Overwrite current localStorage data
      localStorage.setItem('cherry_reservations', JSON.stringify(parsed));
      loadReservations();
      showToast(`Imported ${parsed.length} reservations successfully ✓`, 'success');
    } catch (err) {
      console.error('Import parse error:', err);
      showToast('Error reading JSON backup file.', 'error');
    }
  };
  reader.onerror = () => {
    showToast('Failed to read file.', 'error');
  };
  reader.readAsText(file);
}

/* ──────────────────────────────────────────────────────────
   7. UI UTILITIES & HELPERS
   ────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes(':')) return timeStr;
  if (timeStr.length === 4) {
    const hrs = parseInt(timeStr.slice(0, 2), 10);
    const mins = timeStr.slice(2);
    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 || 12;
    return `${displayHrs}:${mins} ${period}`;
  }
  return timeStr;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
