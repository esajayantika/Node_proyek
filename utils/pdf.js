const fs = require('fs')
const pdf = require('pdfkit')

//ambil gambar di internet dan buat jadi buffer biner biar bisa dibaca pdfkit
const getImage = async(url) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

const generatePdf = async (meal,res) =>{
//membuat file pdf dengan format margin sesuai keinginan
 const doc = new pdf({margins: {
    top: 40,
    bottom: 30,
    left: 50,
    right: 50
  }
})
//kirim respon ke browser
 doc.pipe(res)
//judul beserta pengaturan orientasi dan lebar
 doc.fontSize(24).text(meal.strMeal,{
    width: 500,
    align: 'center'
 })
 doc.fontSize(16).text(meal.strCountry, {align:'center'})
 doc.moveDown()
 //memuat gambar berdasarkan mealthimb di myfav.json
 const image = await getImage(meal.strMealThumb)
 doc.image(image,{
    width: 200
 })
 doc.moveDown()
 //bahan2 edit dari data mentah myfav.json
 const bahan2 = []
 for(let i = 1; i <= 20; i++){
     const bahan = meal[`strIngredient${i}`]
     const takaran = meal[`strMeasure${i}`]
     
     if(bahan && bahan.trim() !== ""){
         bahan2.push(`${takaran} ${bahan}`)
        }
    }
doc.fontSize(16).text('Ingredients')
doc.moveDown()
//tampilkan bahan bahan yang sudah disesuaikan
bahan2.forEach(item => {
    doc.fontSize(12).text(`- ${item}`)
})
//instruksi
doc.moveDown()
doc.fontSize(16).text('Instructions')
doc.moveDown()
const instruction = meal.strInstructions.replace(/\r\n/g, '\n').trim()
 doc.fontSize(11).text(instruction, {
    width:500,
    align:'left',
    lineGap:5
 })

 doc.end()
}
module.exports = {generatePdf}