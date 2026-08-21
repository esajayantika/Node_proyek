const express = require('express');
const app = express();
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const {loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts} = require('./utils/contacts.js')
const {searchResep,detailResep,addMyfav,loadMyfav,deleteMyfav} = require('./utils/resep.js')
const {generatePdf} = require('./utils/pdf.js')
const {body, validationResult, check} = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

//cara menggunakan ejs view engine
app.set('view engine', 'ejs')
//third party middleware

app.use(expressLayouts)

//build in midleware 
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

//konfigurasi flash
app.use(cookieParser('secret'))
app.use(session({
  cookie: {maxAge: 6000},
  secret: 'secret',
  resave:true,
  saveUninitialized: true
})
)
app.use(flash())

//menu resep
app.get('/', async (req, res) => {
  const keyword = req.query.keyword

  if(keyword) {
    const resep = await searchResep(keyword) 

  res.render('index', { 
    layout:'layouts/main-layout',
    title:'Meal Recipe',
    resep,
    keyword
  })
  } else {
    res.render('index', { 
    layout:'layouts/main-layout',
    title:'Meal Recipe', 
    resep: null,
    keyword: null
  })
  }
});

//detail resep
app.get('/meal/:id', async(req,res) => {
  const id = req.params.id
  const detail = await detailResep(id)
  res.json(detail)
})

//tambah ke Myfav
app.post('/add-fav/:id', async(req, res) => {
 const id = req.params.id

 const meal = await detailResep(id)
 
 await addMyfav(meal)
 
 res.json({
  success: true,
  message: 'Resep Berhasil Ditambahkan ke Myfav!'
 })
})

//halaman my Favourites
app.get('/myfav', async(req, res) => {

 const myfavs = await loadMyfav()

 res.render('myfav',{
  layout:'layouts/main-layout',
  title: 'Halaman My Fav',
  myfavs
})
})

//eksport PDF
app.get('/export-pdf/:id', async(req, res) => {

 const myfavs = await loadMyfav()

 const meal = myfavs.find(
  item => item.idMeal === req.params.id
 )
 generatePdf(meal,res)
})

//delete myfav
app.get('/delete-myfav/:id', async(req,res) => {
  const id = req.params.id
  await deleteMyfav(id)
  res.json({
  success: true,
  message: 'Resep Berhasil Dihapus!'
 })
})

app.get('/about', (req, res) => {
  res.render('about', {
    layout:'layouts/main-layout',
    title:'About'})
});
app.get('/contact', (req, res) => {
  const contacts = loadContact()
  res.render('contact', {
    layout:'layouts/main-layout',
    title:'Supplier Contact',
    contacts, 
    pesan: req.flash('pesan')
  })
});

//halaman form tambah data contact
app.get('/contact/add', (req,res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Supplier Contact',
    layout:'layouts/main-layout'
  })
})
//proses add data contact
app.post('/contact', [
  body('nama').custom((value) => {
    const duplikat = cekDuplikat(value)
    if(duplikat){
      throw new Error('Nama Supplier Sudah Terdaftar!')
    }
    return true
  }),
  check('email', 'Email Tidak Valid!!').isEmail(),
  check('nomor', 'Nomor HP Tidak Valid!').isMobilePhone('id-ID')
], (req,res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render('add-contact', {
      title: 'Form Tambah Data Supplier Contact',
      layout: 'layouts/main-layout',
      errors: errors.array()
    })
  } else{
  addContact(req.body)
  //kirimkan flash message
  req.flash('pesan', 'Data Supplier Berhasil Ditambah!')
  res.redirect('/contact')
  }
  
})

//halaman delete data
app.get('/contact/delete/:nama', (req,res) => {
  const contact = findContact(req.params.nama)
  //jika contact tidak ada
  if(!contact){
    res.status(404)
    res.send('<h1>404</h1>')
  } else {
    deleteContact(req.params.nama)
    //kirim flash massage delete data
    req.flash('pesan', 'Data Supplier Berhasil Dihapus!')
    res.redirect('/contact')
  }
  
})

//form ubah data contact
app.get('/contact/edit/:nama', (req,res) => {
  const contact = findContact(req.params.nama)
  res.render('edit-contact', {
    title: 'Form Ubah Data Supplier',
    layout:'layouts/main-layout',
    contact
  })
})
// proses ubah data
app.post('/contact/update', [
  body('nama').custom((value, {req}) => {
    const duplikat = cekDuplikat(value)
    if(value !== req.body.oldNama && duplikat){
      throw new Error('Nama Supplier Sudah Terdaftar!')
    }
    return true
  }),
  check('email', 'Email Tidak Valid!!').isEmail(),
  check('nomor', 'Nomor HP Tidak Valid!').isMobilePhone('id-ID')
], (req,res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render('edit-contact', {
      title: 'Form Ubah Data Supplier',
      layout: 'layouts/main-layout',
      errors: errors.array(),
      contact: req.body
    })
  } else{
  updateContacts(req.body)
  //kirimkan flash message
  req.flash('pesan', 'Data Supplier Berhasil Diubah!')
  res.redirect('/contact')
  }
  
})

//halaman detail contact
app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama)
  res.render('detail', {
    layout:'layouts/main-layout',
    title:'Detail Supplier',
    contact
  })
});

app.use((req,res) => {
  res.status(404)
  res.send('<h1>404</h1>')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
















