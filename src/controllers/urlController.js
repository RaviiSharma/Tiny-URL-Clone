const UrlModel = require("../models/urlModel");
const ShortId = require("shortid");

const redis = require("redis");

const { promisify } = require("util");

//================================= validation ===================================//
const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length > 0) return true;
  return false;
};

const isValidRequest = function (object) {
  return Object.keys(object).length > 0;
};

// using regex for validating url
const isValidUrl = function (value) {
  let regexForUrl =
    /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/;

  return regexForUrl.test(value);
};
////////////////////////////////////////////// connect to redis //////////////////////////////////////////////////////////////

//Connect to redis
const redisClient = redis.createClient(
  10242,
  "redis-10242.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("8qDaW5bKNpnnIV8HtuxsAShWhHjSzsAy", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//1. API  ================================ createUrl ===========================================================================//

const urlShortner = async function (req, res) {
  try {
    const requestBody = req.body;

    if (!isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "data is required" });
    }
    //base url is taken from readme
    const longUrl = req.body.longUrl;
    const base = "http://localhost:3000";

    if (!isValid(longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "URL is required" });
    }

    if (Object.keys(requestBody).length > 1) {
      return res
        .status(400)
        .send({ status: false, message: "invalid entry in request body" });
    }

    if (!isValidUrl(longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid URL" });
    }
    const duplicateUrl = await UrlModel.findOne({ longUrl: longUrl }).select({
      longUrl: 1,
      shortUrl: 1,
      urlCode: 1,
      _id: 0,
    });
    if (duplicateUrl) {
      return res
        .status(200)
        .send({
          status: true,
          msg: "url shorten successfully",
          data: duplicateUrl,
        }); //check the status code later
    }

    const urlCode = ShortId.generate().toLowerCase();
    const shortUrl = base + "/" + urlCode;

    const urlData = {
      urlCode: urlCode,
      longUrl: longUrl.trim(),
      shortUrl: shortUrl,
    };

    const urlData1 = await UrlModel.create(urlData);
    const saveData = {
      longUrl: urlData1.longUrl,
      shortUrl: urlData1.shortUrl,
      urlCode: urlData1.urlCode,
    };

    return res
      .status(201)
      .send({
        status: true,
        message: "url shorten successfully",
        data: saveData,
      });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//2. API ========================================== GET URL ===========================================================================

  const getUrl = async function (req, res) {
  const requestBody = req.body;
  const queryParams = req.query;

  try {
    // query params must be empty
    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid request" });
    }

    if (isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: " input data is not required" });
    }

    const urlCode = req.params.urlCode;

    // if (!/^(?=.[a-zA-Z].)[a-zA-Z\d!@#-_$%&*]{9,}$/.test(urlCode)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: " enter a valid urlCode" });
    // }

    // First lets check inside cache memory
    const urlDataFromCache = await GET_ASYNC(urlCode);

    if (urlDataFromCache) {
      return res.status(302).redirect(urlDataFromCache);
    } else {
      // If cache miss, lets check in our DB, if available then populate the cache
      const urlDataByUrlCode = await UrlModel.findOne({ urlCode });

      if (!urlDataByUrlCode) {
        return res
          .status(404)
          .send({ status: false, message: "no such url exist" });
      }

      const addingUrlDataInCache = SET_ASYNC(urlCode, urlDataByUrlCode.longUrl);

      // if we found the document by urlCode then redirecting the user to original url
      return res.status(302).redirect(urlDataByUrlCode.longUrl);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = { urlShortner, getUrl };
