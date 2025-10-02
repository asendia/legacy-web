import type { TranslationData } from './translation';

export const translationData: TranslationData = {
	// Index page
	title: 'Sejiwo - Surat wasiat online',
	description: 'Sejiwo adalah jasa pengiriman surat wasiat yang terpercaya',
	login: 'masuk',
	logout: 'keluar',
	emailListTo: 'Kepada',
	emailListPlaceholder: 'Email penerima',
	emailListValidity: 'Alamat email yang benar: nama@domain.com',
	emailListHint: 'Klik untuk menambah email penerima (maks 3)',
	contentPlaceholder: 'Pesan ter-enkripsi',
	show: 'munculkan',
	hide: 'sembunyikan',
	on: 'on',
	off: 'off',
	loading: 'Menunggu...',
	draftConflict: 'Konflik data, apakah ingin menggunakan data dari server?',
	draftRecipients: 'Email penerima',
	draftContent: 'Pesan',
	backupSecret:
		'Silahkan membuat copy dari kode berikut dan kirim secara aman ke penerima wasiat. ' +
		'Jika kode hilang maka pesan ini tidak akan bisa dibaca.',
	provideSecret: 'Silahkan masukan kode untuk membaca pesan.',
	authUndefined: 'Silahkan login terlebih dahulu',
	authExpired: 'Sesi berakhir, apakah Anda ingin menyalin data terlebih dahulu?',
	authenticating: 'Mengautentikasi...',
	authenticationError: 'Kesalahan Autentikasi',
	authenticationFailed: 'Autentikasi gagal',
	dismiss: 'Tutup',
	errorLoadingData: 'Kesalahan Memuat Data',
	retry: 'Coba Lagi',
	formSubmit: 'simpan',
	unsubscribeTitle: 'Berhenti berlangganan',
	unsubscribeSuccess: 'Anda berhasil berhenti berlangganan',
	extendTitle: 'Tunda jadwal pengiriman pesan',
	extendSuccess: 'Pengiriman pesan berhasil ditunda',
	secretAPIError: 'Extension URL tidak bisa digunakan. Kembali ke home?',
	secretAPIInvalidRequest: 'Request tidak valid. Kembali ke home?',
	scheduler_pt1: 'Kirim pesan ini jika Anda tidak aktif dalam',
	scheduler_pt2: '',
	scheduler_pt3:
		'Untuk memberitahu bahwa Anda masih aktif, klik ' + 'link yang akan kami kirim setiap',
	scheduler_pt4: 'ke',
	yourEmailPlaceholder: 'email Anda',
	schedulerDays: 'hari',
	sourceCode: 'kode sumber'
};
