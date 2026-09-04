const modalBody = document.querySelector(".modal-body");
const addFav = document.querySelector("#add-fav");
const favMessage = document.querySelector("#fav-message");

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchResult = document.querySelector("#searchResult");
const searchHeader = document.querySelector("#searchHeader");

let meal = null;

const showMealDetail = async (id) => {
  try {
    favMessage.textContent = "";

    const response = await fetch(`/meal/${id}`);
    const detail = await response.json();

    meal = detail;

    //menyusun ulang array bahan bahan
    const bahan2 = [];

    for (let i = 1; i <= 20; i++) {
      const bahan = meal[`strIngredient${i}`];
      const takaran = meal[`strMeasure${i}`];

      if (bahan && bahan.trim() !== "") {
        bahan2.push(`${takaran} ${bahan}`);
      }
    }

    //mengubah bahan bahan menjadi format HTML
    const bahan2HTML = bahan2.map((property) => `<li>${property}</li>`).join("");

    //mengubah format date modified
    const tanggalDb = meal.dateModified;
    let tanggalModif = "";
    if (tanggalDb) {
      const tanggal = new Date(tanggalDb);
      tanggalModif = tanggal.toLocaleDateString("en-GB");
    } else {
      tanggalModif = "-";
    }

    //mendefinisikan format youtube dari hasil req
    const yucubUrl = meal.strYoutube;
    let videoId = null;
    let videoType = null;
    if (yucubUrl) {
      const url = new URL(yucubUrl);
      if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2];
        videoType = "shorts";
      } else {
        videoId = url.searchParams.get("v");
        videoType = "normal";
      }
    }

    //membuat tampilan overview youtube
    let yucubHTML = "";

    if (videoType === "normal") {
      yucubHTML = `<iframe
          width="250"
          height="200"
          src="https://www.youtube.com/embed/${videoId}"
          title="${meal.strMeal}"
          allowfullscreen>
          </iframe>`;
    } else if (videoType === "shorts") {
      yucubHTML = `<iframe
          width="180"
          height="320"
          src="https://www.youtube.com/embed/${videoId}"
          title="${meal.strMeal}"
          allowfullscreen>
          </iframe>`;
    }
    //ubah format instruksi dari \r\n menjadi semua \n
    const instruction = meal.strInstructions.replace(/\r\n/g, "\n").trim();

    //masukan semua ke body-modal
    modalBody.innerHTML = `<div class="container-fluid">
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
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = `
    <div class="text-center py-4">
      <h5>Failed to load recipe 😅</h5>
    </div`;
  }
};

//Event Delegation dipasang jika mendeteksi klik di dalam dokumen browser
document.addEventListener("click", async (e) => {
  const link = e.target.closest(".see-detail");

  if (!link) return;

  e.preventDefault();

  const id = link.dataset.id;

  await showMealDetail(id);
});

//Lakukan Search di Search.ejs
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) return;

    //loading state
    searchHeader.innerHTML = `
    <h2>Searching for "${keyword}"....</h2>
    <p>Please wait...</p>`;

    searchResult.innerHTML = `
    <div class="col text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">Finding delicious recipes...</p>
    </div>`;

    try {
      history.pushState({}, "", `/?keyword=${encodeURIComponent(keyword)}`);
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const resep = await response.json();

      //Handle kalau resep tidak ditemukan
      if (!resep.meals) {
        searchHeader.innerHTML = `
        <h2>Result for "${keyword}"</h2>
        <p>Found No Recipes</p>`;

        searchResult.innerHTML = `
        <div class="col text-center py-5" style="color:#3d2b1f;">
          <h3>|--Recipe Not Found 😅--|</h3>
          <p>Try another/correct key</p>
        </div>`;

        return;
      }

      //Isi header
      searchHeader.innerHTML = `
      <h2>Result for "${keyword}"</h2>
      <p>Found ${resep.meals.length} recipes</p>`;

      //Isi Daftar Card Resep
      searchResult.innerHTML = resep.meals
        .slice(0, 16)
        .map((objek) => {
          return `
        <div class="col-6 col-md-3">
            <div class="card h-100 shadow-sm">
                <div class="position-relative">
                    <img src= "${objek.strMealThumb}" 
                    class="card-img-top" 
                    alt="${objek.strMeal}"
                    style="height: 300px; width: 100%; object-fit: cover;">

                    <div class="position-absolute bottom-0 start-0 end-0 px-3 py-2"
                        style="background: linear-gradient(to top, rgba(0,0,0,0.8),transparent);">
                        <h5 class="card-title text-white m-0 fs-15"> ${objek.strMeal} </h5>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary"> ${objek.strCountry || ""}</h6>
                    <a href="#" class="btn btn-sm see-detail bg-opacity-50" style="background-color: #3d2b1f; color: #ffffff;" 
                        data-bs-toggle="modal" 
                        data-bs-target="#exampleModal" 
                        data-id="${objek.idMeal}">
                        Read More
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div> 
            </div>`;
        })
        .join("");
    } catch (err) {
      console.error(err);
      searchHeader.innerHTML = `
        <h2>Something Went Wrong!!</h2>`;

      searchResult.innerHTML = `
        <div class="col text-center py-5" style="color:#3d2b1f;">
          <p>Failed to load recipes, Please try again.</p>
        </div>`;
    }
  });
}

//tombol add to Myfav
addFav.onclick = async () => {
  if (!meal) return;
  try {
    const response = await fetch(`/add-fav/${meal.idMeal}`, { method: "POST" });

    const result = await response.json();

    //memanggil notif berhasil tambah data
    favMessage.textContent = result.message;

    favMessage.classList.add("show");

    setTimeout(() => {
      favMessage.classList.remove("show");
    }, 2500);
  } catch (err) {
    console.error(err);
    favMessage.textContent = "Failed to add recipe..";
    favMessage.classList.add("show");
  }
};
