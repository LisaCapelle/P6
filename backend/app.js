// dotenv configuration
require('dotenv').config()

// importer Express 
const express = require('express');

// importer path  
const path = require('path');

//importer helmet
const helmet = require('helmet');

// créer l'application Express
const app = express();

// importer mongoose e
const mongoose = require ('mongoose');

// les routes
const userRoutes = require ('./routes/user');
const sauceRoutes = require ('./routes/sauce');

// sécuriser le serveur http
app.use(helmet({
  crossOriginResourcePolicy: false,
  })
);

// connecter mongoose à son cluster 
mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@c${process.env.DB_CLUSTER}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('connecté à MongoDB !'))
  .catch(() => console.log('Connexion MongoDB échouée !'));


/* Middleware qui intercepte les requêtes avec content-type json,
et met ce corps de la requête sur l'objet requête dans req.body = body-parser */
app.use(express.json());

// Pour lever le problème de CORS
app.use((req, res, next) => {
    // accéder à l'API depuis n'importe quelle origine: *
    res.header('Access-Control-Allow-Origin', '*');
    // ajouter headers mentionnés aux requêtes envoyées vers l'API (origin, X-requested-width...)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // envoyer des requêtes avec les méthodes mentionnées
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

// utiliser le middleware static d'express, récupérer le repertoire depuis lequel s'execute le serveur et y concatener le repertoire images
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;