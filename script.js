/* script.js - logic aplikasi CleanHNote
   Pastikan file ini dipanggil di akhir <body> (sudah di index.html)
*/

/* -----------------------
   State (sederhana, in-memory)
   ----------------------- */
const state = {
    currentPage: 'login-page',
    isLoggedIn: false,
    userPlan: 'Free', // 'Free' atau 'Premium'
    users: [
        // contoh user premium untuk testing
        { email: 'User1@gmail.com', password: 'user12345', username: 'PremiumUser', plan: 'Premium' }
    ],
    currentUser: null,
    personalTasks: [],
    teams: [],
    teamTasks: {},
    currentTeamId: null
};

/* -----------------------
   DOM references
   ----------------------- */
const pages = document.querySelectorAll('.page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addTaskForm = document.getElementById('add-task-form');
const createTeamForm = document.getElementById('create-team-form');
const joinTeamForm = document.getElementById('join-team-form');
const assignTeamTaskForm = document.getElementById('assign-team-task-form');
const modalBackdrop = document.getElementById('modal-backdrop');

/* -----------------------
   Utils: modal helpers
   ----------------------- */
function anyModalOpen() {
    return Array.from(document.querySelectorAll('.fixed.inset-x-0.bottom-0')).some(modal => !modal.classList.contains('translate-y-full'));
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modalBackdrop.classList.remove('hidden');
    modal.classList.remove('translate-y-full');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('translate-y-full');

    // tunggu animasi selesai (sesuai duration di CSS: 300ms) lalu sembunyikan backdrop bila tidak ada modal lain
    setTimeout(() => {
        if (!anyModalOpen()) {
            modalBackdrop.classList.add('hidden');
        }
    }, 320);
}

// klik backdrop menutup modal yang terbuka
modalBackdrop.addEventListener('click', () => {
    Array.from(document.querySelectorAll('.fixed.inset-x-0.bottom-0')).forEach(modal => {
        if (!modal.classList.contains('translate-y-full')) {
            closeModal(modal.id);
        }
    });
});

/* -----------------------
   Page navigation
   ----------------------- */
function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');
    state.currentPage = pageId;
    window.scrollTo(0, 0);
}

/* -----------------------
   Toast helper
   ----------------------- */
function showToast(message, isError = false) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast p-3 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-gray-800'}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // hapus setelah animasi selesai (safety 3s)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* -----------------------
   Rendering functions
   ----------------------- */
function renderPersonalTasks() {
    const taskListContainer = document.getElementById('personal-tasks-list');
    const latestTasksContainer = document.getElementById('latest-tasks');

    if (!state.currentUser) {
        // user belum login -> tampilkan placeholder
        taskListContainer.innerHTML = `
            <div class="text-center text-gray-500 mt-16">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <p class="mt-4">Belum ada tugas</p>
                <p class="text-sm">Silahkan login untuk melihat tugas Anda</p>
            </div>`;
        latestTasksContainer.innerHTML = 'Belum ada tugas aktif.';
        latestTasksContainer.classList.add('text-center', 'text-gray-500');
        return;
    }

    const userTasks = state.personalTasks.filter(task => task.owner === state.currentUser.email);

    if (userTasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="text-center text-gray-500 mt-16">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <p class="mt-4">Belum ada tugas</p>
                <p class="text-sm">Tambahkan tugas baru dengan menekan tombol + di bawah</p>
            </div>`;
        latestTasksContainer.innerHTML = 'Belum ada tugas aktif.';
        latestTasksContainer.classList.add('text-center', 'text-gray-500');
    } else {
        taskListContainer.innerHTML = userTasks.map(task => {
            const badgeClass = task.level === 'Tinggi' ? 'bg-red-100 text-red-800' : task.level === 'Sedang' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
            return `
                <button onclick="viewTask(${task.id})" class="w-full text-left bg-white p-4 rounded-lg shadow-sm mb-4 ${task.status === 'Selesai' ? 'task-done' : task.status === 'Dibatalkan' ? 'task-cancelled' : ''}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-gray-800">${escapeHtml(task.title)}</h3>
                            <p class="text-sm text-gray-600">${escapeHtml(task.description || '')}</p>
                        </div>
                        <span class="text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}">${task.level}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-400 mt-2">Tenggat: ${formatDate(task.date)}</p>
                        <span class="text-xs font-bold text-gray-500">${task.status}</span>
                    </div>
                </button>
            `;
        }).join('');

        const latest = userTasks.slice(0, 1)[0];
        latestTasksContainer.innerHTML = `
            <div class="text-left">
                <h3 class="font-bold text-gray-800">${escapeHtml(latest.title)}</h3>
                <p class="text-sm text-gray-600">${escapeHtml(latest.description || '')}</p>
                <p class="text-xs text-gray-400 mt-2">Tenggat: ${formatDate(latest.date)}</p>
            </div>`;
        latestTasksContainer.classList.remove('text-center', 'text-gray-500');
    }
}

function renderTeams() {
    const teamListContainer = document.getElementById('team-list');
    const noTeamView = document.getElementById('no-team-view');
    const myTeamsSummary = document.getElementById('my-teams-summary');

    if (!state.currentUser) {
        teamListContainer.innerHTML = '';
        noTeamView.style.display = 'block';
        myTeamsSummary.innerHTML = 'Belum ada tim.';
        myTeamsSummary.classList.add('text-center', 'text-gray-500');
        return;
    }

    const userTeams = state.teams.filter(team => team.members.includes(state.currentUser.email));

    if (userTeams.length === 0) {
        teamListContainer.innerHTML = '';
        noTeamView.style.display = 'block';
        myTeamsSummary.innerHTML = 'Belum ada tim.';
        myTeamsSummary.classList.add('text-center', 'text-gray-500');
    } else {
        noTeamView.style.display = 'none';
        teamListContainer.innerHTML = userTeams.map(team => `
            <button onclick="viewTeam('${team.id}')" class="w-full text-left bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition">
                <h3 class="font-bold text-gray-800">${escapeHtml(team.name)}</h3>
                <p class="text-sm text-gray-600">${escapeHtml(team.description || '')}</p>
            </button>
        `).join('');
        myTeamsSummary.innerHTML = `<div class="text-left font-semibold">${escapeHtml(userTeams[0].name)}</div>`;
        myTeamsSummary.classList.remove('text-center', 'text-gray-500');
    }
}

function renderTeamInfo(teamId) {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;

    const isOwner = state.currentUser && team.owner === state.currentUser.email;

    document.getElementById('team-info-name').textContent = team.name;
    document.getElementById('team-info-detail-name').textContent = team.name;
    document.getElementById('team-info-detail-desc').textContent = team.description || '-';
    document.getElementById('generated-invite-code').textContent = team.inviteCode || '';
    document.getElementById('team-info-owner').textContent = team.owner;
    document.getElementById('team-info-members-count').textContent = `${team.members.length} anggota`;

    // anggota list
    document.getElementById('team-members-list').innerHTML = team.members.map(memberEmail => {
        const user = state.users.find(u => u.email === memberEmail) || { username: memberEmail.split('@')[0] };
        const isTeamOwner = memberEmail === team.owner;
        return `
            <div class="flex items-center">
                <span class="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">${escapeHtml((user.username || '?').charAt(0).toUpperCase())}</span>
                <div>
                    <p class="font-semibold">${escapeHtml(user.username)} ${memberEmail === (state.currentUser ? state.currentUser.email : '') ? '(Anda)' : ''}</p>
                    <p class="text-xs text-gray-500">${isTeamOwner ? 'Pemilik Tim' : 'Anggota'}</p>
                </div>
            </div>`;
    }).join('');

    // tugas tim
    const teamTasksList = document.getElementById('team-tasks-list');
    const tasksForTeam = state.teamTasks[team.id] || [];
    if (tasksForTeam.length > 0) {
        teamTasksList.innerHTML = tasksForTeam.map(task => `
            <div class="border-t py-3 text-left">
                <p class="font-semibold">${escapeHtml(task.title)}</p>
                <p class="text-sm text-gray-500">Untuk: ${escapeHtml(task.memberLabel || task.member)}</p>
                <p class="text-xs text-gray-400 mt-1">Tenggat: ${formatDate(task.date)}</p>
            </div>
        `).join('');
    } else {
        teamTasksList.innerHTML = '<div class="text-center text-gray-500 py-4">Belum ada tugas untuk tim ini.</div>';
    }

    // show/hide owner controls
    const addTeamBtn = document.getElementById('add-team-task-btn');
    const inviteCodeBtn = document.getElementById('invite-code-btn');
    const deleteTeamBtn = document.getElementById('delete-team-btn');

    addTeamBtn.style.display = isOwner ? 'block' : 'none';
    inviteCodeBtn.style.display = isOwner ? 'block' : 'none';
    deleteTeamBtn.style.display = isOwner ? 'block' : 'none';

    // populate assign-to-member select
    const assignSelect = document.getElementById('assign-to-member');
    if (assignSelect) {
        assignSelect.innerHTML = team.members.map(m => {
            const u = state.users.find(u => u.email === m);
            const label = u ? u.username : m;
            return `<option value="${m}">${escapeHtml(label)} ${m === (state.currentUser ? state.currentUser.email : '') ? '(Anda)' : ''}</option>`;
        }).join('');
    }
}

/* -----------------------
   Dashboard update
   ----------------------- */
function updateDashboard() {
    const title = document.getElementById('dashboard-title');
    const welcomeNotif = document.getElementById('welcome-notification');
    const createTeamBtn = document.getElementById('create-team-button');

    if (state.userPlan === 'Premium' && state.currentUser) {
        title.innerHTML = `CleanHNote <span class="text-sm font-medium bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Premium</span>`;
        welcomeNotif.innerHTML = `<h3 class="font-bold">Selamat datang, ${escapeHtml(state.currentUser.username)}!</h3><p class="text-sm">Akses Fitur Lengkap</p>`;
        createTeamBtn.style.display = 'block';
    } else if (state.currentUser) {
        title.textContent = 'CleanHNote';
        welcomeNotif.innerHTML = `<h3 class="font-bold">Selamat datang, ${escapeHtml(state.currentUser.username)}!</h3><p class="text-sm">Upgrade ke premium untuk fitur tim.</p>`;
        createTeamBtn.style.display = 'none';
    }

    // render lists
    renderPersonalTasks();
    renderTeams();
}

/* -----------------------
   Auth & Handlers
   ----------------------- */
function handleSuccessfulAuth() {
    // tutup modal apapun yang terbuka
    Array.from(document.querySelectorAll('.fixed.inset-x-0.bottom-0')).forEach(modal => {
        if (!modal.classList.contains('translate-y-full')) {
            closeModal(modal.id);
        }
    });
    updateDashboard();
    showPage('dashboard-page');
}

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showModal('register-page');
});

document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('register-page');
});

document.getElementById('logout-button').addEventListener('click', () => {
    state.isLoggedIn = false;
    state.currentUser = null;
    state.userPlan = 'Free';
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    Array.from(document.querySelectorAll('.fixed.inset-x-0.bottom-0')).forEach(modal => {
        if (!modal.classList.contains('translate-y-full')) {
            closeModal(modal.id);
        }
    });

    showPage('login-page');
    showToast('Berhasil logout.');
});

/* -----------------------
   Form events
   ----------------------- */

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value || '';
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        state.isLoggedIn = true;
        state.currentUser = user;
        state.userPlan = user.plan || 'Free';
        showToast(`Login berhasil sebagai ${state.currentUser.username}.`);
        handleSuccessfulAuth();
    } else {
        showToast('Email atau password salah.', true);
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (document.getElementById('reg-username').value || '').trim();
    const email = (document.getElementById('reg-email').value || '').trim().toLowerCase();
    const password = document.getElementById('reg-password').value || '';

    if (!username || !email || !password) {
        showToast('Lengkapi semua data.', true);
        return;
    }

    if (state.users.some(u => u.email.toLowerCase() === email)) {
        showToast('Email sudah terdaftar.', true);
        return;
    }

    const newUser = { username, email, password, plan: 'Free' };
    state.users.push(newUser);

    state.isLoggedIn = true;
    state.currentUser = newUser;
    state.userPlan = 'Free';

    showToast('Registrasi berhasil!');
    handleSuccessfulAuth();
});

addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentUser) {
        showToast('Silakan login terlebih dahulu.', true);
        return;
    }

    const newTask = {
        id: Date.now(),
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-desc').value.trim(),
        level: document.getElementById('task-level').value,
        date: document.getElementById('task-date').value,
        status: 'Baru',
        owner: state.currentUser.email
    };

    state.personalTasks.unshift(newTask);
    renderPersonalTasks();
    addTaskForm.reset();
    closeModal('add-task-modal');
    showToast('Tugas baru berhasil ditambahkan.');
});

createTeamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.userPlan !== 'Premium') {
        showToast('Fitur ini hanya untuk pengguna Premium.', true);
        return;
    }

    const newTeam = {
        id: `team-${Date.now()}`,
        name: document.getElementById('team-name').value.trim(),
        description: document.getElementById('team-desc').value.trim(),
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        owner: state.currentUser.email,
        members: [state.currentUser.email]
    };

    state.teams.unshift(newTeam);
    state.teamTasks[newTeam.id] = [];
    renderTeams();
    createTeamForm.reset();
    closeModal('create-team-modal');
    showToast('Tim baru berhasil dibuat.');
});

joinTeamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentUser) {
        showToast('Silakan login terlebih dahulu.', true);
        return;
    }
    const code = (document.getElementById('invite-code').value || '').trim().toUpperCase();
    const team = state.teams.find(t => t.inviteCode === code);

    if (team) {
        if (team.members.includes(state.currentUser.email)) {
            showToast('Anda sudah menjadi anggota tim ini.', true);
        } else {
            team.members.push(state.currentUser.email);
            showToast(`Berhasil bergabung dengan tim ${team.name}.`);
            renderTeams();
        }
    } else {
        showToast('Kode undangan tidak valid.', true);
    }

    joinTeamForm.reset();
    closeModal('join-team-modal');
});

assignTeamTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const team = state.teams.find(t => t.id === state.currentTeamId);
    if (!team) {
        showToast('Tim tidak ditemukan.', true);
        return;
    }

    const member = document.getElementById('assign-to-member').value;
    const memberUser = state.users.find(u => u.email === member);
    const newTeamTask = {
        id: Date.now(),
        title: document.getElementById('team-task-title').value.trim(),
        description: document.getElementById('team-task-desc').value.trim(),
        member,
        memberLabel: memberUser ? memberUser.username : member,
        date: document.getElementById('team-task-date').value
    };

    if (!state.teamTasks[team.id]) state.teamTasks[team.id] = [];
    state.teamTasks[team.id].unshift(newTeamTask);

    renderTeamInfo(state.currentTeamId);
    closeModal('assign-team-task-modal');
    assignTeamTaskForm.reset();
    showToast('Tugas berhasil diberikan.');
});

/* -----------------------
   View / actions
   ----------------------- */
function viewTeam(teamId) {
    state.currentTeamId = teamId;
    renderTeamInfo(teamId);
    showPage('team-info-page');
}

function viewTask(taskId) {
    const task = state.personalTasks.find(t => t.id === taskId);
    if (!task) return;

    const content = document.getElementById('view-task-content');
    content.innerHTML = `
        <div class="mb-4">
            <h2 class="text-2xl font-bold">${escapeHtml(task.title)}</h2>
            <p class="text-sm text-gray-500">Tenggat: ${formatDate(task.date)}</p>
        </div>
        <p class="text-gray-700 mb-4">${escapeHtml(task.description || 'Tidak ada deskripsi.')}</p>
        <div class="flex justify-between items-center mb-6">
             <span class="text-sm font-semibold">Prioritas: ${escapeHtml(task.level)}</span>
             <span class="text-sm font-bold">Status: ${escapeHtml(task.status)}</span>
        </div>
        <h3 class="font-semibold mb-2">Ubah Status</h3>
        <div class="grid grid-cols-2 gap-3">
            <button onclick="updateTaskStatus(${task.id}, 'Dalam Proses')" class="w-full py-2 bg-blue-500 text-white rounded-md">Dalam Proses</button>
            <button onclick="updateTaskStatus(${task.id}, 'Selesai')" class="w-full py-2 bg-green-500 text-white rounded-md">Selesai</button>
            <button onclick="updateTaskStatus(${task.id}, 'Dibatalkan')" class="w-full py-2 bg-red-500 text-white rounded-md">Batalkan</button>
            <button onclick="closeModal('view-task-modal')" class="w-full py-2 bg-gray-200 rounded-md">Tutup</button>
        </div>
    `;
    showModal('view-task-modal');
}

function updateTaskStatus(taskId, newStatus) {
    const task = state.personalTasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        renderPersonalTasks();
        closeModal('view-task-modal');
        showToast(`Status tugas diubah menjadi "${newStatus}".`);
    }
}

function copyInviteCode() {
    const code = document.getElementById('generated-invite-code').textContent;
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
        showToast('Kode undangan disalin!');
    }).catch(() => {
        showToast('Gagal menyalin kode undangan.', true);
    });
}

/* -----------------------
   Helpers
   ----------------------- */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (err) {
        return dateStr;
    }
}

/* simple escape HTML untuk mencegah injeksi */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/* -----------------------
   Inisialisasi minimal (opsional)
   ----------------------- */
// tampilkan halaman login di awal
showPage('login-page');
