const express = require("express");
const app = express();
const port = 3000;
require("./utils/db.js"); //Menjalankan koneksi ke MongoDB
const expressLayouts = require("express-ejs-layouts");
const { searchResep, detailResep, addMyfav, loadMyfav, deleteMyfav } = require("./utils/resep.js");
const { generatePdf } = require("./utils/pdf.js");
const { loadSelection } = require("./utils/dataloader.js");
const Supplier = require("./model/supplier.js");
const Myfav = require("./model/myfav.js");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");

//cara menggunakan ejs view engine
app.set("view engine", "ejs");
//third party middleware

app.use(expressLayouts);

//build in midleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//setup method-override
app.use(methodOverride("_method"));

//konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(flash());

//menu resep
app.get("/", async (req, res) => {
  const keyword = req.query.keyword?.trim();
  const json = loadSelection();
  if (keyword && keyword.length > 0) {
    const resep = await searchResep(keyword);

    res.render("search", {
      layout: "layouts/main-layout",
      title: "Recipe Collection",
      resep,
      keyword,
      json,
    });
  } else {
    res.render("index", {
      layout: "layouts/main-layout",
      title: "Meal Recipe",
      // resep: null,
      // keyword: null,
      json,
    });
  }
});

//kirim data ke resep.ejs
app.get("/api/search", async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();

    if (!keyword) {
      return res.json({
        meals: null,
      });
    }
    const resep = await searchResep(keyword);
    res.json(resep);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch recipes",
    });
  }
});

//detail resep
app.get("/meal/:id", async (req, res) => {
  const id = req.params.id;
  const detail = await detailResep(id);
  res.json(detail);
});

//tambah ke Myfav
app.post("/add-fav/:id", async (req, res) => {
  const id = req.params.id;

  const meal = await detailResep(id);

  const hasil = await addMyfav(meal);

  res.json(hasil);
});

//halaman my Favourites
app.get("/myfav", async (req, res) => {
  const myfavs = await loadMyfav();

  res.render("myfav", {
    layout: "layouts/main-layout",
    title: "List Myfav",
    myfavs,
  });
});

//eksport PDF
app.get("/export-pdf/:id", async (req, res) => {
  try {
    const meal = await Myfav.findOne({ idMeal: req.params.id });
    generatePdf(meal, res);
  } catch (err) {
    req.flash("error", err.messsage);
    res.send(err);
  }
});

//delete myfav
app.delete("/myfav/:id", async (req, res) => {
  const id = req.params.id;
  const hasil = await deleteMyfav(id);
  res.json(hasil);
});

//Halaman About
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About",
  });
});

//Halaman Contact
app.get("/contact", async (req, res) => {
  const contacts = await Supplier.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Supplier Contact",
    contacts,
    pesan: req.flash("pesan"),
  });
});

//halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Supplier Contact",
    layout: "layouts/main-layout",
  });
});
//proses add data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Supplier.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama Supplier Sudah Terdaftar!");
      }
      return true;
    }),
    check("email", "Email Tidak Valid!!").isEmail(),
    check("nomor", "Nomor HP Tidak Valid!").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Add Data Supplier Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      try {
        await Supplier.create(req.body);
        //kirimkan flash message
        req.flash("pesan", "Data Supplier Berhasil Ditambah!");
        res.redirect("/contact");
      } catch (err) {
        //menangani eror koneksi DB
        req.flash("error", err.messsage);
        res.send(err);
      }
    }
  },
);

//halaman delete data
app.delete("/contact", async (req, res) => {
  try {
    await Supplier.deleteOne({ nama: req.body.nama });
    //kirim flash massage delete data
    req.flash("pesan", "Data Supplier Berhasil Dihapus!");
    res.redirect("/contact");
  } catch (err) {
    //Tangani masalah koneksi DB
    req.flash("error", err.message);
    res.send(err);
  }
});

//form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  try {
    const contact = await Supplier.findOne({ nama: req.params.nama });
    res.render("edit-contact", {
      title: "Change Data Supplier",
      layout: "layouts/main-layout",
      contact,
    });
  } catch {
    req.flash("error", err.message);
    res.send(err);
  }
});

// proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Supplier.findOne({ nama: value });

      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama Supplier Sudah Terdaftar!");
      }

      return true;
    }),

    check("email", "Email Tidak Valid!!").isEmail(),
    check("nomor", "Nomor HP Tidak Valid!").isMobilePhone("id-ID"),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Change Data Supplier",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      try {
        await Supplier.findByIdAndUpdate(req.body._id, {
          nama: req.body.nama,
          nomor: req.body.nomor,
          email: req.body.email,
        });
        //kirimkan flash message
        req.flash("pesan", "Data Supplier Berhasil Diubah!");
        res.redirect("/contact");
      } catch (err) {
        req.flash("error", err.message);
        res.send(err);
      }
    }
  },
);

//halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  try {
    const contact = await Supplier.findOne({ nama: req.params.nama });
    res.render("detail", {
      layout: "layouts/main-layout",
      title: "Detail Supplier",
      contact,
    });
  } catch (err) {
    req.flash("error", err.message);
    res.send(err);
  }
});

app.use((req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
