//jalankan setiap reload halaman
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname
    //ambil semua link navbar
    const links = document.querySelectorAll('.nav-link')
    //looping setiap link untuk menambah event listener
    links.forEach(link => {

        // Jika href link cocok dengan URL saat ini, tambahkan class active
        if (link.getAttribute('href') === currentPath || link.href === window.location.href) {
            link.classList.add('active')
        }
    })
})
