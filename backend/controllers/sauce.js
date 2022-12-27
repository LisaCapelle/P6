//LOGIQUE DE METIER DES ROUTES

// importer objet
const Sauce = require('../models/sauce');

// importer la méthode fs
const fs = require("fs");

// importer la méthode path
const path = require('path');


// AFFICHER TOUTES LES SAUCES
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  )
  .catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// VOIR UNE SAUCE 
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  })
  .then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  )
  .catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// AJOUTER UNE SAUCE
exports.createSauce = (req, res, next) =>{
  // parser
  const sauceObject = JSON.parse(req.body.sauce);

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
    likes:0,
    dislikes:0,
    usersLiked:[],
    usersDisliked:[]
  });
  sauce.save()
  .then(() => {res.status(201).json({message: 'Objet enregistré'})})
  .catch(error => {res.status(400).json({error})})
};

// MODIFIER UNE SAUCE
exports.modifySauce = (req, res, next) => {
  // 2 formats de requête différents : si fichier transmis -> en réponse objet sous la forme de chaine de caractères, si non -> fichier format différent

  // vérifier s'il y a un champ "file" dans l'objet requête donc extraire l'objet soit parsé soit récupéré directement dans le corps de la requête
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

  // supprimer le userId venant de la requête pour éviter que qqn créé un objet à son nom puis le modifie en l'assignant à qqn d'autre
  delete sauceObject._userId;

  // chercher l'objet dans la BdD pour vérifier si c'est le bon utilisateur qui veut le modifier
  Sauce.findOne({_id: req.params.id})
    // en cas de succès récupérer l'objet et vérifier s'il appartient à l'utilisateur qui veut modifier
  .then((sauce) => {
      // si le userId de la BdD est différent de l'userId du token
      if (sauce.userId != req.auth.userId){
        res.status(403).json({message: 'Non-autorisé'});
      } else {
        // mettre à jour l'objet: quel enregistrement mettre à jour, avec quel objet (objet récupéré dans le corps de la fn, et avec l'id qui vient des paramètres de l'URL)
        Sauce.updateOne({ _id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message : 'Objet modifié'}))
        .catch(error => res.status(401).json({ error }));
      }
  })
  .catch((error) => {
    res.status(400).json({error});
  });
};

// SUPPRIMER UNE SAUCE
exports.deleteSauce = (req, res, next) => {
  
  // vérifier les droits: récupérer l'objet en BdD, gérer succès (vérifier si c'est le bon propriétaire sinon erreur (403)) et erreur (500)
  Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({message: 'Not authorized'});
          
     // si c'est le bon utilisateur supprimer l'objet de la BdD et l'image du système des fichiers: récupérer URL et recréer le chemin      
      } 
      else {
        // récupérer nom fichier (split)           
        const filename = sauce.imageUrl.split('/images/')[1];
        // faire suppression (unlink de fs)
        fs.unlink(`images/${filename}`, () => {
        // gérer le callback: créer une méthode une fois que la suppression est faite - supprimer l'enregistrement dans la BdD
        Sauce.deleteOne({_id: req.params.id})
          .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
          .catch(error => res.status(403).json({ error }));
        });
      }
    })
    .catch( error => {
      res.status(500).json({ error });
    });
};

// LIKER UNE SAUCE avec fonction externalisée "likeModifications"

// fonction likeModifications
const likeModifications = (body, sauce) => {
  // identifier qui like la sauce
  const isLiked = sauce.usersLiked.find (element => element === body.userId);
  const isDisliked = sauce.usersDisliked.find (element => element === body.userId);

  // si like
  if (body.like === 1){
      sauce.likes++;
      sauce.usersLiked.push(body.userId);
  }

  // si annuler like ou dislike
  if (body.like === 0){
    //annuler le like
    if(isLiked && !isDisliked){
      sauce.likes = (sauce.likes === 0) ? 0 : --sauce.likes;
      sauce.usersLiked = sauce.usersLiked.filter( element => element !== body.userId);    
    }
    // annuler le dislike
    if(isDisliked && !isLiked){
      sauce.dislikes = (sauce.dislikes === 0) ? 0 : --sauce.dislikes;
      sauce.usersDisliked = sauce.usersDisliked.filter( element => element !== body.userId);
    } 
  }

  // si dislike
  if (body.like === -1){
    sauce.dislikes++;
    sauce.usersDisliked.push(body.userId);
  }
}

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      // identifier qui like la sauce
      const isLiked = sauce.usersLiked.find (element => element === req.body.userId);
      const isDisliked = sauce.usersDisliked.find (element => element === req.body.userId);
      // likes
      if (req.body.like === 1){
        if (isLiked) return Promise.reject( res.status(409).json({ message:'cannot like the sauce twice' }) );
        if (isDisliked) return Promise.reject( res.status(409).json({ message:'cannot like the sauce you disliked' }) ); 
      }
      // annulation likes ou dislikes
      if(req.body.like === 0){
        if(!isDisliked && !isLiked ) return Promise.reject(res.status(400).json({ message:'bad request' }));
      }
      // dislikes
      if(req.body.like === -1){
        if (isDisliked) return Promise.reject( res.status(409).json({ message:'cannot dislike the sauce twice' }) );
        if (isLiked) return Promise.reject( res.status(409).json({ message:'cannot like the sauce twice' }) );
      }
      // else: appeler fonction 
      likeModifications(req.body, sauce);
      // maj données
      const updateSauce = {
        likes: sauce.likes,
        dislikes: sauce.dislikes,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked
      }
      // retourner valeur pour qu'elle soit utilisable dans le prochain then
      return updateSauce;
    })

    .then ( updateSauce => {      
      Sauce.updateOne({_id: req.params.id}, {...updateSauce})
      .then( () => {
        if(req.body.like === 1) {
          res.status(201).json({ message:'like sauce successfully' })
        }
        if(req.body.like === -1) {
          res.status(201).json({ message:'dislike sauce successfully' })
        }
        if(req.body.like === 0) {
          res.status(201).json({ message:'cancelled successfully' })
        } 
      })
      .catch(
        (error) => {
        res.status(404).json({error: error});
      })
    })
    .catch(
      (error) => {
        res.status(403).json({error: error});
      }
    );
};