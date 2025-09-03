const mongoose= require('mongoose');
require('dotenv').config();
const ConnectionString = process.env.URL
async function connectToDatabase(){
   try{await mongoose.connect(ConnectionString)
    console.log("connected to mongodb");}catch(error){console.log(error);}
}
module.exports = connectToDatabase;