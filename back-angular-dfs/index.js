const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());

app.use(express.static("uploads"));

// Configuration de la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "angular-dfs",
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL");
});

// Configuration du middleware pour le parsing du corps de la requête
app.use(express.json());

// Route pour récupérer tous les products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des products :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    res.json(results);
  });
});

// Route pour récupérer un product par son ID
app.get("/product/:id", (req, res) => {
  const articleId = req.params.id;
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [articleId],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'product :", err);
        res.status(500).send("Erreur serveur");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Article non trouvé");
        return;
      }
      res.json(results[0]);
    }
  );
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const product = JSON.parse(req.body.product);
    const extension = file.originalname.split(".").pop();
    const filename = "image_product_" + product.title + "." + extension;
    req.filename = filename;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage }).array("file");

// Route pour créer un nouveau product
app.post("/product", upload, (req, res) => {
  const product = JSON.parse(req.body.product);

  db.query("INSERT INTO products SET ?", product, (err, result) => {
    if (err) {
      console.error("Erreur lors de la création du produit :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    product.id = result.insertId;
    res.status(201).json(product);
  });
});



// Route pour mettre à jour un product
app.put("/product/:id", upload, (req, res) => {
  const articleId = req.params.id;
  const product = JSON.parse(req.body.product);
  db.query(
    "UPDATE products SET ? WHERE id = ?",
    [product, articleId],
    (err) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du produit :", err);
        res.status(500).send("Erreur serveur");
        return;
      }
      //NOK -> res.sendStatus(200);
      res.status(200).json(product);
    }
  );
});

// Route pour supprimer un product
app.delete("/product/:id", authenticateToken, (req, res) => {
  const articleId = req.params.id;

  if(req.user.admin != 1) {
    res.sendStatus(403);
  }


  db.query("DELETE FROM products WHERE id = ?", [articleId], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du produit :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    res.sendStatus(204);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe dans la base de données
  db.query("SELECT * FROM user WHERE email = ?", [email], (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Adresse e-mail incorrecte" });
    }

    const user = results[0];

    // Vérifier le mot de passe
    bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
      if (bcryptErr || !bcryptResult) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { email: user.email, admin: user.admin },
        "your_secret_key",
        { expiresIn: "1d" } // Expiration du token
      );

      // Retourner le token JWT
      res.json({ token });
    });
  });
});

// Point de terminaison pour l'inscription
app.post('/signup', (req, res) => {
  const { email, password, admin } = req.body;

  // Vérifier si l'utilisateur existe déjà dans la base de données
  db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Hasher le mot de passe avant de l'enregistrer dans la base de données
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        throw hashErr;
      }

      // Insérer le nouvel utilisateur dans la base de données
      db.query('INSERT INTO user (email, password, admin) VALUES (?, ?, ?)', [email, hashedPassword, admin], (insertErr, insertResult) => {
        if (insertErr) {
          throw insertErr;
        }

        // Générer un token JWT pour l'utilisateur nouvellement inscrit
        const token = jwt.sign(
          { email, admin },
          'your_secret_key',
          { expiresIn: '1h' } // Expiration du token
        );

        // Retourner le token JWT
        res.json({ token });
      });
    });
  });
});


// Route pour récupérer toutes les daily list
app.get("/daily-list", (req, res) => {
  db.query("SELECT * FROM daily_list", (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des listes :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    res.json(results);
  });
});

// Route pour récupérer une daily list par son ID
app.get("/daily-list/:id", (req, res) => {
  const articleId = req.params.id;
  db.query(
    "SELECT * FROM daily_list WHERE id = ?",
    [articleId],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération de la list :", err);
        res.status(500).send("Erreur serveur");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Liste non trouvée");
        return;
      }
      res.json(results[0]);
    }
  );
});


// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

