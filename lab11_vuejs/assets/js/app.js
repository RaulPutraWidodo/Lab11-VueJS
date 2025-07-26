const { createApp } = Vue;

// Tentukan lokasi API REST End Point Anda
// Contoh: 'http://localhost:8080/post' jika Anda mengaksesnya langsung
// atau 'http://localhost/labci4/public/post' jika public bukan root
const apiUrl = 'http://localhost/Lab11_ci/ci4/public/post'; // Sesuaikan ini dengan URL API Anda!

createApp({
    data() {
        return {
            artikel: [], // Array untuk menyimpan data artikel
            
            // Objek untuk data form (digunakan untuk tambah dan ubah)
            formData: {
                id: null,
                judul: '',
                isi: '',
                status: 0 // Default status (misal: 0 untuk Draft)
            },
            
            showForm: false, // Kontrol tampilan modal form
            formTitle: 'Tambah Data', // Judul modal form
            
            // Opsi untuk dropdown status
            statusOptions: [
                {text: 'Draft', value: 0}, // Sesuaikan value dengan kolom status di DB (0/1 atau 'Draft'/'published')
                {text: 'Publish', value: 1} // Jika status di DB Anda adalah string 'Draft'/'published', gunakan itu sebagai value
            ],
        };
    },
    
    // Dipanggil saat instance Vue selesai di-mount
    mounted() {
        this.loadData();
    },
    
    methods: {
        // Fungsi untuk memuat data artikel dari API
        loadData() {
            axios.get(apiUrl)
                .then(response => {
                    // Jika API mengembalikan { artikel: [...] }, akses response.data.artikel
                    // Jika API hanya mengembalikan [...], akses response.data
                    this.artikel = response.data.artikel || response.data; 
                    console.log("Data artikel dimuat:", this.artikel);
                })
                .catch(error => {
                    console.error("Error memuat data:", error);
                    alert("Gagal memuat data artikel. Cek konsol untuk detail.");
                });
        },
        
        // Fungsi untuk mengubah tampilan status (dari angka/boolean ke teks)
        statusText(status) {
            // Sesuaikan logika ini dengan bagaimana status disimpan di database Anda
            // Jika di DB adalah '0' atau '1' (string/number)
            if (status == 1 || status == '1' || status === 'published') {
                return 'Publish';
            } else if (status == 0 || status == '0' || status === 'Draft') {
                return 'Draft';
            }
            return ''; // Default jika status tidak dikenali
        },
        
        // Fungsi untuk menampilkan form tambah data
        tambah() {
            this.showForm = true;
            this.formTitle = 'Tambah Data';
            // Reset formData agar kosong untuk entri baru
            this.formData = {
                id: null,
                judul: '',
                isi: '',
                status: 0 // Default status untuk form tambah
            };
        },
        
        // Fungsi untuk menghapus artikel
        hapus(index, id) {
            if (confirm('Yakin ingin menghapus data ini?')) {
                axios.delete(apiUrl + '/' + id)
                    .then(response => {
                        alert(response.data.messages.success); // Tampilkan pesan sukses dari API
                        this.artikel.splice(index, 1); // Hapus item dari array di frontend
                        // Alternatif: this.loadData(); // Memuat ulang semua data dari server
                    })
                    .catch(error => {
                        console.error("Error menghapus data:", error.response || error);
                        alert("Gagal menghapus artikel: " + (error.response?.data?.messages?.error || error.message || "Terjadi kesalahan."));
                    });
            }
        },
        
        // Fungsi untuk mengisi form dengan data artikel yang akan diubah
        edit(data) {
            this.showForm = true;
            this.formTitle = 'Ubah Data';
            // Isi formData dengan data dari baris yang dipilih
            this.formData = {
                id: data.id,
                judul: data.judul,
                isi: data.isi,
                // Pastikan status sesuai dengan value di statusOptions (misal: 0 atau 1)
                status: data.status == 'published' ? 1 : (data.status == 'Draft' ? 0 : data.status)
            };
            console.log("Mengedit item:", this.formData);
        },
        
        // Fungsi untuk menyimpan atau mengubah data (dipanggil saat form disubmit)
        saveData() {
            // Jika formData.id ada, berarti ini adalah operasi ubah (PUT)
            if (this.formData.id) {
                axios.put(apiUrl + '/' + this.formData.id, this.formData)
                    .then(response => {
                        alert(response.data.messages.success || "Artikel berhasil diubah!");
                        this.loadData(); // Muat ulang data setelah perubahan
                        this.showForm = false; // Sembunyikan form
                        console.log('Item diperbarui:', response.data);
                    })
                    .catch(error => {
                        console.error("Error memperbarui item:", error.response || error);
                        alert("Gagal mengubah artikel: " + (error.response?.data?.messages?.error || error.message || "Terjadi kesalahan."));
                    });
            } else {
                // Jika formData.id null, berarti ini adalah operasi tambah (POST)
                axios.post(apiUrl, this.formData)
                    .then(response => {
                        alert(response.data.messages.success || "Artikel berhasil ditambahkan!");
                        this.loadData(); // Muat ulang data setelah penambahan
                        this.showForm = false; // Sembunyikan form
                        console.log('Item ditambahkan:', response.data);
                    })
                    .catch(error => {
                        console.error("Error menambahkan item:", error.response || error);
                        alert("Gagal menambahkan artikel: " + (error.response?.data?.messages?.error || error.message || "Terjadi kesalahan."));
                    });
            }
            
            // Reset form data setelah operasi selesai (atau di dalam then/catch block)
            this.formData = {
                id: null,
                judul: '',
                isi: '',
                status: 0
            };
        },
    },
}).mount('#app'); // Mount aplikasi Vue ke elemen dengan id "app"