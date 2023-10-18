const mongoose = require('mongoose');

 const getMongoDBID = (id) =>{
   if(id){
     return mongoose.Types.ObjectId(id)
   }
}

module.exports = getMongoDBID;
