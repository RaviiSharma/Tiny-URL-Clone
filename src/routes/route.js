const express = require('express')
const {urlShort, getUrl} = require('../controllers/urlController')
const router = express.Router()

// API for url shortening 
router.post('/url/shorten',urlShort  )

router.get("/:urlCode",getUrl)


router.all("/**", function (req,res){
    res
        .status(404)
        .send({status:false, message:"Api requested is not available"});
})

module.exports = router