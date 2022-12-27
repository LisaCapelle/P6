//importer rate limiter
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    winidowMs: process.env.WINDOWMS,
    max:process.env.MAX, // limit each Ip to MAX request per windowMs
    message: 'You exceeded the authorized number of requests, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;