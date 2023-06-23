const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const scheduler = require('./scheduler/scheduler.js');
// const authenticateToken = require('./middlewares/authenticateToken.js')
const db = require('./db');
const cron = require('node-cron');

app.use(cors());

app.use(express.static("uploads"));

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


// Tous les jours a minuit on créé la daily-list pour chaque user et on supprime celles qui date de plus d'une semaine
cron.schedule('0 0 * * *', () => {
  scheduler.executeScheduledTasksForUsers();
});

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

// Route pour supprimer un produit
app.delete("/product/:id", authenticateToken, (req, res) => {
  const articleId = req.params.id;

  if (req.user.admin != 1) {
    return res.sendStatus(403);
  }

  db.query("DELETE FROM products WHERE id = ?", [articleId], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du produit :", err);
      return res.status(500).send("Erreur serveur");
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
        { email: user.email, admin: user.admin, user_id: user.id },
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
        const user_id = insertResult.insertId;

        // Créer la liste journalière de l'utilisateur à la création du compte
        const currentDate = new Date().toISOString().slice(0, 10);
        const types = [
          { type: 'Petit déjeuner', image: 'breakfast.png' },
          { type: 'Repas de midi', image: 'meal.png' },
          { type: 'Encas', image: 'snack.png' },
          { type: 'Repas du soir', image: 'nightMeat.png' }
        ];

        types.forEach((item) => {
          db.query('INSERT INTO daily_list (user_id, date, type, picture) VALUES (?, ?, ?, ?)', [user_id, currentDate, item.type, item.image], (dailyListErr, dailyListResult) => {
            if (dailyListErr) {
              throw dailyListErr;
            }
          });
        });

        // Générer un token JWT pour l'utilisateur nouvellement inscrit
        const token = jwt.sign(
          { email, admin, user_id },
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
app.get("/daily-list", authenticateToken, (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const userId = req.user.user_id;
  db.query(
    "SELECT * FROM daily_list WHERE user_id = ? AND date = ?",
    [userId, currentDate],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des listes :", err);
        res.status(500).send("Erreur serveur");
        return;
      }
      res.json(results);
    }
  );
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

// Route pour mettre à jour la liste journalière
app.put("/daily-list/:id", upload, (req, res) => {
  const dailyListId = req.params.id;
  const updatedData = { product_id: req.body.product_id };
  db.query(
    "UPDATE daily_list SET ? WHERE id = ?",
    [updatedData, dailyListId],
    (err) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de la liste quotidienne :", err);
        res.status(500).send("Erreur serveur");
        return;
      }
      res.status(200).json(updatedData);
    }
  );
});



// Route pour supprimer un produit d'une liste journalière
app.delete("/daily-list/:id", authenticateToken, (req, res) => {
  const dailyListId = req.params.id;

  db.query("UPDATE daily_list SET product_id = NULL WHERE id = ?", [dailyListId], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du produit :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    res.sendStatus(204);
  });
});



app.get("/weekly-consumption", authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  const query = `
      SELECT 
      SUM(p.calories) AS total_calories, 
      SUM(p.lipid) AS total_lipids, 
      SUM(p.carbohydrate) AS total_carbohydrates, 
      SUM(p.protein) AS total_proteins, 
      dl.date, 
      dl.type
    FROM 
      daily_list dl
    JOIN 
      products p ON dl.product_id = p.id
    WHERE 
      dl.user_id = ?
      AND dl.date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
      AND dl.type IN ('Petit déjeuner', 'Repas de midi', 'Encas', 'Repas du soir')
    GROUP BY 
      dl.date, 
      dl.type
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des données :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    console.log(results)
    res.json(results);
  });
});

// Todo placer dans un dossier middleware
// Middleware pour vérifier le token JWT et récupérer l'ID de l'utilisateur
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = {
      user_id: decodedToken.user_id,
      admin: decodedToken.admin
    };
    next();
  });
}