// importer mongoose
const mongoose = require('mongoose');

// rajouter le validateur comme plugin au schema
const uniqueValidator = require('mongoose-unique-validator');

// créer user schema en utilisant la fn schema de mongoose
const userSchema = mongoose.Schema({
    // rajouter la configuration 1 mail 1 user seulement
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        match: [/^.[^éèçàµù@"()\[\]\\<>,;:]+@(?:[\w-]+\.)+\w+$/, "Please fill a valid email address"],
        trim: true, 
    },
    password: {
        type: String, 
        required: [true, "Password is required"]
    }
});

// appliquer le validateur au schema avant d'en faire un modele
userSchema.plugin(uniqueValidator);

// exporter ce schema sous la forme d'un modèle en utilisant la fonction modele de mongoose
module.exports = mongoose.model('User', userSchema);