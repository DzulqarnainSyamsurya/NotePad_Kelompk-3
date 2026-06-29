// --- AMBIL ELEMEN DOM ---
const notesForm = document.getElementById('notes-form');
const notesInput = document.getElementById('notes-input');
const notesSelect = document.getElementById('notes-category-select');
const notesDeadline = document.getElementById('notes-deadline-input');
const notesList = document.getElementById('notes-list');

const catInput = document.getElementById('category-input');
const catBtn = document.getElementById('btn-add-category');
const catList = document.getElementById('category-list');

const activeCountEl = document.getElementById('active-count');
const completedCountEl = document.getElementById('completed-count');

// --- STATE DATA (MENGGUNAKAN LOCALSTORAGE) ---
let notes = JSON.parse(localStorage.getItem('notes_dl')) || [];
// Menambahkan 'Umum' sebagai cadangan jika kategori bawaan dihapus oleh user
let categories = JSON.parse(localStorage.getItem('categories_dl')) || ['Kerja', 'Kuliah', 'Belanja', 'Umum'];
let selectedCategoryFilter = ''; // Menampung kategori yang sedang aktif diklik

// --- MANAJEMEN STATS COUNTER ---
function updateStats() {
    const activeTasks = notes.filter(t => !t.completed).length;
    const completedTasks = notes.filter(t => t.completed).length;
    activeCountEl.textContent = activeTasks;
    completedCountEl.textContent = completedTasks;
}

// --- MANAJEMEN KATEGORI SIDEBAR ---
function renderCategories() {
    catList.innerHTML = '';
    // Reset dropdown option di form agar tidak duplikat
    notesSelect.innerHTML = '<option value="" disabled selected>Kategori</option>';

    categories.forEach((cat) => {
        // 1. Merender daftar kategori di sidebar kiri
        const li = document.createElement('li');
        // Jika kategori ini sedang aktif difilter, berikan class 'active' agar warnanya berubah cokelat tua
        li.className = `category-item ${selectedCategoryFilter === cat ? 'active' : ''}`;
        li.innerHTML = `
            <span onclick="filterByCategory('${cat}')">📁 ${cat}</span>
            <button class="delete-cat-btn" onclick="deleteCategory(event, '${cat}')">✕</button>
        `;
        catList.appendChild(li);

        // 2. Merender pilihan di dalam dropdown form input kanan
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        notesSelect.appendChild(option);
    });

    localStorage.setItem('categories_dl', JSON.stringify(categories));
}

// Fitur: Tambah Kategori Baru
catBtn.addEventListener('click', () => {
    const catName = catInput.value.trim();
    if (catName === '') return;
    
    if (!categories.includes(catName)) {
        categories.push(catName);
        catInput.value = '';
        renderCategories();
    }
});

// Fitur: Hapus Kategori
window.deleteCategory = function(event, catName) {
    event.stopPropagation(); // Mencegah trigger filter ketika tombol hapus diklik
    categories = categories.filter(c => c !== catName);
    if (selectedCategoryFilter === catName) selectedCategoryFilter = '';
    
    // Tugas yang kategorinya dihapus otomatis diubah ke 'Umum' agar tidak hilang
    notes = notes.map(notes => {
        if (notes.category === catName) notes.category = 'Umum';
        return notes;
    });

    renderCategories();
    saveAndRendernotes();
};

// Fitur Utama: Klik Kategori di Sidebar untuk Memfilter Tugas
window.filterByCategory = function(catName) {
    // Jika kategori yang sama diklik lagi, batalkan filter (tampilkan semua)
    selectedCategoryFilter = (selectedCategoryFilter === catName) ? '' : catName;
    renderCategories(); // Render ulang sidebar untuk memperbarui class .active
    renderNotes();      // Render ulang daftar tugas sesuai filter
};

// --- MANAJEMEN TUGAS TO-DO ---
function saveAndRendernotes() {
    localStorage.setItem('notes_dl', JSON.stringify(notes));
    renderNotes();
}

// Kalender
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Fitur Utama: Merender dan Mengurutkan Tugas
function renderNotes() {
    notesList.innerHTML = '';

    // LOGIKA URUTKAN DEADLINE: Mengurutkan array berdasarkan tanggal terkecil (paling dekat) ke terbesar
    notes.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    notes.forEach((notes, index) => {
        // LOGIKA FILTER KATEGORI: Jika ada kategori yang sedang diklik, lewati tugas yang tidak cocok
        if (selectedCategoryFilter !== '' && notes.category !== selectedCategoryFilter) return;

        const li = document.createElement('li');
        li.className = `notes-item ${notes.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="notes-left-part" onclick="toggleComplete(${index})">
                <span class="circle-checkbox"></span>
                <span>${notes.text}</span>
            </div>
            <div class="badge-group">
                <span class="notes-tag">${notes.category}</span>
                <span class="notes-deadline">📅 ${formatDate(notes.deadline)}</span>
            </div>
            <button class="delete-action-btn" onclick="deleteNotes(${index})">✕</button>
        `;

        notesList.appendChild(li);
    });

    updateStats();
}

// Fitur: Tambah Tugas Lewat Form
notesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = notesInput.value.trim();
    const category = notesSelect.value;
    const deadline = notesDeadline.value;

    if (text === '' || !category || !deadline) return;

    notes.push({
        text: text,
        category: category,
        deadline: deadline,
        completed: false
    });

    notesInput.value = '';
    notesSelect.value = ''; 
    notesDeadline.value = '';
    
    saveAndRendernotes();
});

// Fitur: Klik Ceklis Tugas Selesai / Batal Selesai
window.toggleComplete = function(index) {
    notes[index].completed = !notes[index].completed;
    saveAndRendernotes();
};

// Fitur: Hapus Tugas
window.deleteNotes = function(index) {
    notes.splice(index, 1);
    saveAndRendernotes();
};

// --- FITUR AUTO SAVE CATATAN ---
const fields = ['notes-area'];

fields.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
        element.value = localStorage.getItem(id) || '';

        element.addEventListener('input', () => {
            localStorage.setItem(id, element.value);
        });
    }
});

// Jalankan render pertama kali saat web dibuka
renderCategories();
rendernotes();
