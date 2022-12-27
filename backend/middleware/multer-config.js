// importer multer
const multer = require('multer');

// dictionnaire des mime types
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png':'png'
}

// créer un objet de configuration pour multer
const storage = multer.diskStorage({
    // fonction destination avec 3 arguments
    destination: (req, file, callback) => {
        // 2 arguments: null pour dire qu'il n'y a pas eu d'erreur, et le nom du dossier
        callback(null, 'images')
    },
    // generer le fichier (ne pas reprendre le fichier d'origine qui peut être le même et generer des pb)
    filename: (req, file, callback) => {
        // ici generer le nom en replacant les espaces par _
        const regEx = /[\.\s-]/g;
        const name = file.originalname.replace(regEx,'_');
        const extension = MIME_TYPES[file.mimetype];
        //appeler le callback et 2 arguments: pas d'erreur et nom avec timestamp en millisecondes
        callback(null, name + '_' + Date.now() + '.' + extension);
    }
});

const fileFilter = (req, file, callback) => {
    if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
        callback(null, true);
    }else {
        callback(null, false);
    }
}

// exporter le middleware multer fichier et non pas un groupe de fichiers et fichier image uniquement
const upload = multer({ storage , fileFilter})

module.exports = upload.single('image');
