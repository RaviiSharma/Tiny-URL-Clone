const express = require("express")
const router = express.Router()
const UrlController = require('../controllers/urlController')



router.post('/url/shorten', UrlController.urlShortener )

router.get('/:urlCode', UrlController.getUrl)




module.exports = router