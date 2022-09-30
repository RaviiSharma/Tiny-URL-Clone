const express = require('express')
const UrlController = require('../controllers/urlController')

const router = express.Router()


// API for url shortening 
router.post('/url/shorten', UrlController.urlShortner )

router.get("/:urlCode", UrlController.getUrl)


router.all("/**", function (req,res){
    res
        .status(404)
        .send({status:false, message:"the api you requested is not available"});
})



module.exports = router