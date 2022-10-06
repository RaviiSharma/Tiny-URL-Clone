const UrlModel = require("../models/urlModel")
const ShortId = require("shortid");
const validURL = require("valid-url")
const axios = require("axios")
const redis = require("redis")
const { promisify } = require("util")

//================================= Validations ====================================================//

const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function (object) {
    return Object.keys(object).length > 0;
};


// ================================== Connecting to Redis ===============================================//

const redisClient = redis.createClient(
    12856,
    "redis-12856.c257.us-east-1-3.ec2.cloud.redislabs.com",
    { no_ready_check: true }
)
redisClient.auth("5XZCq7DTR4UeARJsFEV5luM2v1R50pUQ", function (err) {
    if (err) throw err
})

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)  
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)


//==================================== Creating a URL ==================================================//

const urlShortener = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequest(requestBody)) {
            return res.status(400).send({ status: false, message: "data is required" });
        }

        const longUrl = req.body.longUrl;
        const base = "http://localhost:3000";

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "URL is required" });
        }

        if (Object.keys(requestBody).length > 1) {
            return res.status(400).send({ status: false, message: "invalid entry in request body" });
        }

        if (!validURL.isUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid URL 1" })
        }

        let cachedURLCode = await GET_ASYNC(`${longUrl}`)
        if (cachedURLCode) {
            return res.status(201).send({ status: true, message: "Already URL shorten(GET)", data: JSON.parse(cachedURLCode)})
        }

        let URLDOC = await UrlModel.findOne({ longUrl: longUrl.trim()}).select({ _id: 0, __v: 0 })
        if (URLDOC) {
            await SET_ASYNC(`${longUrl}`,JSON.stringify(URLDOC),"EX",10)
            return res.status(201).send({ status: true, message: "ALready URL shorten(SET)", data: URLDOC })
        }

        let obj = {
            method: "get",
            url: longUrl
        }
        // making promise 
        let urlFound = await axios(obj).then(()=>urlFound=true).catch(() => { urlFound = false });
        if (!urlFound) {
            return res.status(400).send({ status: false, message: "Please provide valid LongUrl(RDOP)" })
        }
      
        const urlCode = ShortId.generate().toLowerCase();
        const shortUrl = base + "/" + urlCode;

        const urlData = { urlCode: urlCode, longUrl: longUrl.trim(), shortUrl: shortUrl };


        const urlData1 = await UrlModel.create(urlData);
        const saveData = ({ longUrl: urlData1.longUrl, shortUrl: urlData1.shortUrl, urlCode: urlData1.urlCode })
        await SET_ASYNC(`${longUrl}`,JSON.stringify(saveData),"EX",10)
        return res.status(201).send({ status: true, message: "url shorten successfully", data: saveData });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

//==================================== Redirecting to URL ==================================================//

const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        if (!ShortId.isValid(req.params.urlCode.trim())) {
            return res.status(400).send({ status: false, message: "Please provide valid urlCode" })
        }
        let cachedURLCode = await GET_ASYNC(`${req.params.urlCode}`)
        if (cachedURLCode) {
            return res.status(200).redirect(JSON.parse (cachedURLCode).longUrl)
        } else {
            const cachedData = await UrlModel.findOne({ urlCode: urlCode })
            if (!cachedData) {
                return res.status(404).send({ status: false, message: "Long URL Not Found" })
            }
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(cachedData), "EX",10)
            return res.status(302).redirect(cachedData.longUrl)
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })   
    }
}
    

//==================================== Exporting ==================================================//

module.exports = { urlShortener, getUrl };

