const express = require('express')
const router = express.Router()
const UrlController = require('../controllers/urlController')



// API for url shortening 
router.post('/url/shorten', UrlController.urlShortner )




module.exports = router