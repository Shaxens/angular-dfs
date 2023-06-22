const jwt = require("jsonwebtoken");


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

module.exports = {
  authenticateToken
};