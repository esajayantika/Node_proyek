const fs = require('fs')


//membuat folder data jika belum ada
const dirPath = './data'
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath)
}
//membuat file contacts.json jika belum ada
const dataPath = './data/contacts.json'
if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath, '[]', 'utf-8')
}
//ambil semua data di contact.json
const loadContact = () => {
    const file = fs.readFileSync('data/contacts.json', 'utf-8')
    const json = JSON.parse(file);
    return json
}
//cari contact berdasarkan mana
const findContact = (nama) =>{
    const contacts = loadContact()
    const contact = contacts.find(
        (contact) => contact.nama.toLowerCase() === nama.toLowerCase()
    )
    return contact
}

//menulis/menimpa file contacts.json dengan data yang baru
const saveContacts = (contacts) => {
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts,null,2))
}

//menambah contac baru ke array baru
const addContact = (contact) => {
    const contacts = loadContact()
    contacts.push(contact)
    saveContacts(contacts)
}

//cek duplikasi nama
const cekDuplikat = (nama) => {
    const contacts = loadContact()
    return contacts.find((contact) => contact.nama === nama)
}

//delete data contact
const deleteContact = (nama) => {
    const contacts = loadContact()
    const filteredContacts = contacts.filter((contact) => contact.nama !== nama)
    saveContacts(filteredContacts)
}

//mengubah data contact
const updateContacts = (contactBaru) => {
    const contacts = loadContact()
    //hilangkan contact lama yang namanya sama dengan oldnama
    const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldNama)
    delete contactBaru.oldNama
    filteredContacts.push(contactBaru)
    saveContacts(filteredContacts)
}
module.exports = {loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts}