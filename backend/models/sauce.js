// importer mongoose
const mongoose = require('mongoose');

// créer schema (champ id pas nécessaire car généré par mongoose)
const sauceSchema = mongoose.Schema({
userId: {type: String, required: true },
name: {type: String, required: true },
manufacturer: {type: String, required: true },
description: {type: String, required: true },
mainPepper: {type: String, required: true },
imageUrl: {type: String, required: true },
heat: {type: Number, required: true },
likes: {type: Number},
dislikes: {type: Number},
usersLiked: {type: Array},
usersDisliked: {type: Array}
});

// exporter le modèle avec 2 arguments: nom du modèle et nom du schema
module.exports = mongoose.model('Sauce', sauceSchema);