const express  = require('express')
const mongoose = require('mongoose')
const app = express()
const route = require('./routes/route')


app.use(express.json())
app.use(express.urlencoded({extended:true}))


mongoose.connect("mongodb+srv://RaviKumarSharma:i6tpVmiNCvIQSjH6@cluster0.pnzdn4a.mongodb.net/group41Database")
.then(()=>console.log('Mongodb Conneted....'))
.catch(err=>console.log(err))

app.use('/',route)


app.listen(3000,()=>console.log(`Server listing on 3000`))

