const UrlModel = require("../models/urlModel")
const ShortId = require("shortid")

//================================= validation ===================================//
const isValid = function(value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function(object) {
    return Object.keys(object).length > 0;
};

// using regex for validating url
const isValidUrl = function(value) {
    let regexForUrl =
    /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/;

    return regexForUrl.test(value);
};
//================================ createUrl =================================================//

const urlShortner = async function(req, res) {
    try{
    const requestBody = req.body;
    
    if (!isValidRequest(requestBody)) {
        return res.status(400).send({ status: false, message: "data is required" });
    }
    //base url is taken from readme
    const longUrl = req.body.longUrl;
    const base = "http://localhost:3000";

    if (!isValid(longUrl)) {
        return res.status(400).send({ status: false, message: "URL is required" });
    }

    if (Object.keys(requestBody).length > 1) {
        return res.status(400).send({ status: false, message: "invalid entry in request body" });
    }

    if (!isValidUrl(longUrl)) {
        return res.status(400).send({ status: false, message: "Enter a valid URL" });
    }
    const duplicateUrl = await UrlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
    if (duplicateUrl) {
        return res.status(409).send({ status: true,msg:"longUrl already exists", data: duplicateUrl }) //check the status code later
    }

        const urlCode = ShortId.generate().toLowerCase();
        const shortUrl = base + "/" + urlCode;

        const urlData = {urlCode: urlCode,longUrl: longUrl.trim(),shortUrl: shortUrl};

        
        const urlData1 = await UrlModel.create(urlData);
        const saveData=({longUrl:urlData1.longUrl,shortUrl:urlData1.shortUrl,urlCode:urlData1.urlCode})

        return res.status(201).send({status: true,message: "url shorten successfully",data: saveData});
    
    
} catch (err) {
        res.status(500).send({ error: err.message });
    }
}
module.exports = { urlShortner}