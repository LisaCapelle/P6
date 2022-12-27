// CONTROLLEUR UTILISATEUR

// passwordValidator
var passwordValidator = require('password-validator');

// modele user
const User = require('../models/user');

// package de cryptage pour les mdp
const bcrypt = require('bcrypt');

// token
const jwt = require('jsonwebtoken');

// SIGN UP
exports.signup = (req, res, next) => {

    // fn asynchrone de hachage
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User ({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message: 'Utilisateur créé'})) 
                .catch(error => {res.status(400).json({error})});
        })
        .catch(error => res.status(500).json({error}));
};

// LOGIN
exports.login = (req, res, next) => {
    //method findOne de la classe User à qui on passe l'objet qui sert de filtre
    User.findOne({email: req.body.email})
        .then(user =>{
            // si utilisateur n'existe pas - message flou pour ne pas faire fuiter données
            if (user === null){
                res.status(403).json({message: 'paire identif/mdp incorrecte'});
            }
            else{
                //fonction "compare" de bcrypt qui renvoie aussi une promesse
                bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid){
                        //erreur d'authentification (mauvais mdp transmis)
                       res.status(403).json({message: 'paire identif/mdp incorrecte'})
                    }else{
                        //si mdp correct retourner l'objet nécessaire à l'authentification par la suite
                        res.status(200).json({
                            userId: user._id,
                            // appeler une fonction de jsonwebtoken avec 3 arguments: données à encoder (payload), clé secrète pour encodage, configuration
                            token: jwt.sign(
                                {userId: user._id},
                                process.env.TOKEN_SECRET,
                                {expiresIn: process.env.TOKEN_EXPIRE}
                            )
                        });
                    }
                })
                .catch(error => {
                    // erreur de serveur
                    res.status(500).json({error});
                })
            }
        })
        .catch(error => {
            // erreur de serveur
            res.status(500).json({error});
        })
};