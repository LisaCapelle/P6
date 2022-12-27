// importer express
const express = require('express');
//importer rate limiter
const limiter = require('../middleware/rate-limiter');
// importer password validator
const password = require('../middleware/password');

// créer router avec la fonction Router d'express
const router = express.Router();

// controller pour associer user aux differentes routes
const {signup, login} = require('../controllers/user');

// 2 routes post car le frontend envoie aussi des infos (adresse mail et mdp) en rajoutant password validator
router.post('/signup', password, signup);

//rajouter le limiter pour l'authentification
router.post('/login', limiter, login);

// exporter le router
module.exports = router;