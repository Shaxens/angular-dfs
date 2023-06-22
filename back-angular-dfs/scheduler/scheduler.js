const db = require('../db');

// Méthode pour récupérer tous les utilisateurs de la base de données
function getAllUsers(callback) {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

function addDailyTypes(userId) {
  const currentDate = new Date().toISOString().split('T')[0];

  const types = [
    { type: 'Petit déjeuner', image: 'breakfast.png' },
    { type: 'Repas de midi', image: 'meal.png' },
    { type: 'Encas', image: 'snack.png' },
    { type: 'Repas du soir', image: 'nightMeat.png' }
  ];
  
  types.forEach((item) => {

    db.query('INSERT INTO daily_list (user_id, date, type, picture) VALUES (?, ?, ?, ?)', [userId, currentDate, item.type, item.image], (dailyListErr, dailyListResult) => {
      if (dailyListErr) {
        console.error('Erreur lors de l\'ajout des types de plats :', dailyListErr);
      } else {
        console.log(`Type de plat "${item}" ajouté avec succès pour la date ${currentDate}`);
      }
    });
  });
}


function deleteOldTypes(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const formattedDate = oneWeekAgo.toISOString().split('T')[0]; // Formatte la date au format "YYYY-MM-DD"
  
  db.query('DELETE FROM daily_list WHERE date < ?', [formattedDate, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression des anciens types de plats :', err);
    } else {
      console.log(`Types de plats datant d'il y a plus d'une semaine ont été supprimés`);
    }
  });
}

// Fonction pour exécuter les tâches planifiées pour chaque utilisateur
function executeScheduledTasksForUsers() {
  getAllUsers((err, users) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
      return;
    }

    users.forEach((user) => {
      addDailyTypes(user.id);
      deleteOldTypes(user.id);
    });
  });
}

module.exports = {
  executeScheduledTasksForUsers
};