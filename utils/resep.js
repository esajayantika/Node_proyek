const fs = require('fs')

const searchResep = async (keyword) => {
const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`)
const hasil = await response.json()
return hasil
}

const detailResep = async (id) => {
const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
const hasil = await response.json()
return hasil.meals[0]
}
//membuat folder data jika belum ada
const dirPath = './data'
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath)
}
//membuat file myfav.json jika belum ada
const dataPath = './data/myfav.json'
if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath, '[]', 'utf-8')
}

//ambil semua data di myfav.json
const loadMyfav = async () => {
    const file = await fs.promises.readFile('data/myfav.json', 'utf-8')
    const json = JSON.parse(file);
    return json
}
//timpa file myfav.json dengan aray baru
const saveMyfav = async (meals) => {
    await fs.promises.writeFile('data/myfav.json',JSON.stringify(meals,null,2))
}

//add data mealdb ke myfav.json
const addMyfav = async (meal) =>{ 
    const meals = await loadMyfav()
    const sudahAda = meals.some(
        item => item.idMeal === meal.idMeal
    )
    if(!sudahAda){
        meals.push(meal)
        await saveMyfav(meals)
    }
}

//delete data myfav
const deleteMyfav = async (idMeal) => {
    const meals = await loadMyfav()
    //pilih resep yang tidak sama dengan yang ingin dihapus lalu simpan daftar resep yang baru (tanpa resep yang ingin dihapus)
    const filteredMeals = meals.filter((meal) => meal.idMeal !== idMeal)
    await saveMyfav(filteredMeals)
} 

module.exports = {searchResep,detailResep,addMyfav,loadMyfav,deleteMyfav}