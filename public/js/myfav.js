const delFav = document.querySelectorAll('.delete')
const favMessage = document.querySelector('#fav-message')

delFav.forEach(tombol => {
    //setiap tombol delete di klik lakukan fetch url dan tampilkan notif
    tombol.addEventListener('click', async () => {
        const id = tombol.dataset.id

        const response = await fetch(`/delete-myfav/${id}`)
    //ambil respon jsonnya
        const result = await response.json()
    //hapus baris setelah hapus data myfav.json
    if(result.success){
        tombol.closest('tr').remove()
        
    //atur ulang penomoran
    document.querySelectorAll('tbody tr').forEach((row, index) => {
    row.querySelector('th').textContent = index + 1})

    //memanggil notif berhasil hapus data
    favMessage.textContent = result.message

    favMessage.classList.add('show')

    setTimeout(() => {
       favMessage.classList.remove('show') 
    }, 2500);
    }
    
    })
})


