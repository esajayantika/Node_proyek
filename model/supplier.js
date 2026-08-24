const mongoose = require('mongoose')

//Membuat Schema
const supplierSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    nomor: {
        type: String,
        required: true
    },
    email: {
        type: String
    }
}, {collection: 'supplier'})

//Mengakses model
const Supplier = mongoose.model('supplier', supplierSchema)

module.exports = Supplier