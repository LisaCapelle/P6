// importer express
const express = require('express');

//importer multer
const multer = require('../middleware/multer-config');

// importer le middleware d'authentification
const auth = require('../middleware/auth');

const router = express.Router();

//importer le controller
const sauceCtrl = require('../controllers/sauce');

/* rajouter le middleware d'authentification AVANT le gestionnaire des routes
et rajouter multer APRES le middleware d'authentification et AVANT le reste */
router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;