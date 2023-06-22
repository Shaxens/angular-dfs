const mysql = require('mysql');

// Configuration de la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "angular-dfs",
});

module.exports = db;