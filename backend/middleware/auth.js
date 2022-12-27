// importer json web token
const jwt = require('jsonwebtoken');

//exporter la fonction qui sera le middleware
const auth = (req, res, next) => {
    // récupérer le token en 2 parties: bearer + le token, il faut enlever la première partie pour ne garder que le token
    try{
        // récupérer le header, diviser la chaine de caractères en 2 autour de l'espace sous la forme d'un tableau et récupérer la seconde partie
        const token = req.headers.authorization.split(' ')[1];
        // décoder le token en passant à la fonction le token et la clé secrète 
        const decodedToken = jwt.verify(token,process.env.TOKEN_SECRET);
        // récuper le user ID en particulier
        const userId = decodedToken.userId;
        /* rajouter cette valeur à l'objet request qui est transmis aux routes appelées par la suite;
        donc créer une requête avec objet auth et un champ id dedans */
        req.auth = {
            userId: userId
        };
        req.body.userId = userId;
        next();
    }
    catch(error){
        res.status(401).json({error});
    }
};

module.exports = auth;