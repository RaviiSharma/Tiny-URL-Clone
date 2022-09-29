const mongoose = require('mongoose');
const urlModel = require('../models/urlModel');
const shortID = require('shortid');

const isValidURL = function(url) {
    return (/^(ftp|http|https):\/\/[^ "]+$/).test(url);
 }


const createUrl = async function (req,res){
   try{ let data = req.body
    
    if(data==0) { return res.status(400).send({status:false,msg:'data is mandatory '})}

    if(!urlCode){ return res.status(400).send({status:false,msg:'urlCode is mandatory'});}
    if(!isValidURL(urlCode)){ return res.status(400).send({status:false,msg:'urlCode should be valid'})}
     
    if(!longUrl){ return res.status(400).send({status:false,msg:'longUrl is mandatory'})}
    if(!isValidURL(longUrl)){ return res.status(400).send({status:false,msg:'longUrl should be valid'})}

    if(!shortUrl){ return res.status(400).send({status:false,msg:'shortUrl is mandatory'})}
    if(!isValidURL(shortUrl)){ return res.status(400).send({status:false,msg:'shortUrl should be valid'})}



    
    
























}catch{}
} 