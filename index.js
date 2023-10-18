const mongoose = require('mongoose');
const util = require('util');

// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');

const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;
let mongoUri;
// connect to mongo db
if (config.env === "production") {
  if(config.mongoRsConStr){
    mongoUri = config.mongoRsConStr
  }else{
    mongoUri = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`;
    
  }
  console.log("mongoDB URI " + mongoUri);
  
 //mongoUri = config.mongo.host;
} else {
  mongoUri = `${config.mongo.host}/${config.mongo.db}`;
}
console.log(mongoUri);
mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('connected', () => {
  console.log("Successful connected")
});
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(collectionName);
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;
