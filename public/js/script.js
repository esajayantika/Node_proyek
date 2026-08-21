const links = document.querySelectorAll('.see-detail');
const modalBody = document.querySelector('.modal-body');
const addFav = document.querySelector('#add-fav')
const favMessage = document.querySelector('#fav-message')
let meal = null

links.forEach(link => {
  link.addEventListener('click', async () => {
    favMessage.textContent = ''
    const id = link.dataset.id;

    const response = await fetch(`/meal/${id}`);
    const detail = await response.json();
    meal = detail

    //menyusun ulang array bahan bahan
    const bahan2 = []
    for(let i = 1; i <= 20; i++){
        const bahan = meal[`strIngredient${i}`]
        const takaran = meal[`strMeasure${i}`]

        if(bahan && bahan.trim() !== ""){
            bahan2.push(`${takaran} ${bahan}`)
        }
    }
    //mengubah bahan bahan menjadi format HTML
    const bahan2HTML = bahan2
    .map(property => `<li>${property}</li>`)
    .join('')

    //mengubah format date modified
    const tanggalDb = meal.dateModified
    let tanggalModif = ''
    if(tanggalDb){
        const tanggal = new Date(tanggalDb)
        tanggalModif = tanggal.toLocaleDateString('en-GB')
        
    }else{
        tanggalModif = "-" 
    }
    
    //mendefinisikan format youtube dari hasil req
    const yucubUrl = meal.strYoutube
    let videoId = null
    let videoType = null
    if (yucubUrl){
        const url = new URL(yucubUrl)
        if(url.pathname.startsWith('/shorts/')){
            videoId = url.pathname.split('/')[2]
            videoType = 'shorts'
        } else {
            videoId = url.searchParams.get('v')
            videoType = 'normal'
        }
    }

    //membuat tampilan overview youtube
    let yucubHTML = ''

    if (videoType === 'normal') {
        yucubHTML = `<iframe
        width="250"
        height="200"
        src="https://www.youtube.com/embed/${videoId}"
        title="${meal.strMeal}"
        allowfullscreen>
        </iframe>`
    } else if (videoType === 'shorts') {
        yucubHTML = `<iframe
        width="180"
        height="320"
        src="https://www.youtube.com/embed/${videoId}"
        title="${meal.strMeal}"
        allowfullscreen>
        </iframe>`
    }
    //ubah format instruksi
    console.log(JSON.stringify(meal.strInstructions))
    const instruction = meal.strInstructions.replace(/\r\n/g, '\n').trim()

    //masukan semua ke body-modal
    modalBody.innerHTML = 
    `<div class="container-fluid">
        <div class="row">
            <div class="col-md-5">
                <img src="${meal.strMealThumb}" class="img-fluid">
            </div>
            <div class="col-md-7">
                <h3 class = "mb-1">${meal.strMeal}</h3>
                <span class= "text-muted">${meal.strCountry}</span>
                <h6 class= "text-muted">Date Modified: ${tanggalModif}</h6>
                ${yucubHTML}

            </div>
        </div>
        <hr>
         <h5>Ingredients</h5>
            <ul>
            ${bahan2HTML}
            </ul>
        <hr>
            <h5>Instructions</h5>
            <p class="instructions">${instruction}</p>
            <link rel="stylesheet" href="/css/style.css">
    </div>`;
  })
});
 //tombol add to Myfav
  addFav.onclick = async() => {
    if(!meal) return

    const response = await fetch(`/add-fav/${meal.idMeal}`, {method:'POST'})
    
    const result = await response.json()
    
//memanggil notif berhasil tambah data
    favMessage.textContent = result.message

    favMessage.classList.add('show')

    setTimeout(() => {
       favMessage.classList.remove('show') 
    }, 2500);
  }
