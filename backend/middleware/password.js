// importer password validator
const passwordValidator = require("password-validator");

// créer schéma password validator
const passwordSchema = new passwordValidator();
//ajouter les propriétés
passwordSchema
.is().min(6)                                    // Minimum length 6
.is().max(15)                                  // Maximum length 15
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digit
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }
    else{
        return res
        .status(400)
        .json({error: `mot de passe pas assez fort  ${passwordSchema.validate('req.body.password', {list: true})}`})
    }
}