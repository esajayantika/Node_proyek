const fs = require('fs')
const Myfav = require('../model/myfav')

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

//ambil semua data di database
const loadMyfav = async () => {
    return await Myfav.find()
}

//add data mealdb ke myfavs collection
const addMyfav = async (meal) =>{ 
    try {
        const sudahAda = await Myfav.findOne({idMeal: meal.idMeal})
        if(!sudahAda){
            await Myfav.create(meal)
            return{success: true, message: 'Resep Berhasil Ditambahkan ke Myfav'}
        } else {
            return{success: false, message: 'Resep Sudah Ada di Daftar Myfav'}
        }
    } catch (err) {
        return {sucess: false, message: 'Gagal menyimpan ke database'}
    }
}

//delete data myfav
const deleteMyfav = async (id) => {
    try {
        await Myfav.deleteOne({idMeal: id})
        return {success: true, message: 'Resep Berhasil Dihapus'}
    } catch (err) {
        return {success: false, message: 'Gagal menghapus data'}
    }
} 

module.exports = {searchResep,detailResep,addMyfav,loadMyfav,deleteMyfav}