const { Promise } = require("bluebird");
const http = require("https");
class httpUtility {
  constructor() {}

  post(options, data) {
   return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        if (res.statusCode == 200 || 201)
        res.on("data", (chunk) => {

          if(chunk && typeof chunk === "object"){
            console.log("Data ",chunk.toString('utf8'))
            try {
              resolve(JSON.parse(chunk.toString()));
            } catch (error) {
              reject("Invalid response")
            }
          }else{
            reject("Invalid response")
          }
        });
      });
      req.on("error", (error) => {

        console.error(error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}

module.exports = httpUtility;
