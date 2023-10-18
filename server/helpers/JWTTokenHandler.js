const jwt = require("jsonwebtoken");
const  config  = require("../../config/config");
const resfreshtokenmodel = require("../refreshtoken/refresh.model");
const crypto=require('crypto')
const { resolve, reject } = require("bluebird");
let expiration;
let SECRET;
let options;
let userToken;
class JwtToken{
    constructor(){
        expiration = process.env.NODE_ENV === "development" ? 1800000: 1800000;//Jwt token 30 minutes
        SECRET = config.jwtSecret
        options = { expiresIn: expiration};
    }

    getJWTToken(accountId,memberId){
        const payload = { accountId: accountId, memberId : memberId };
        const token = jwt.sign(payload, SECRET, options)
        console.log("token::",token)
        return token;
    }

    getRefreshToken(accountId,memberId){
        console.log("getRefreshToken inside::",accountId,memberId)
        return new Promise((resolve,reject) =>{
            const payload = { accountId: accountId,memberId : memberId };
            const reftoken = jwt.sign(payload, SECRET, { expiresIn: '30d' });
            let decrptAccountId=this.decrypt(accountId)
            const refreshtoken = {
                refresh_token : reftoken,
                accountId: decrptAccountId,
                status: "ACTIVE"
            }
            
            resfreshtokenmodel.findOneAndUpdate({'accountId' : decrptAccountId},refreshtoken, {upsert: true, new: true}).exec()
            .then((token) => {console.log("token from db::",token.refresh_token);
                resolve(token.refresh_token)})
            .catch((err) => {reject(err)})
        })


    }

    verifyTokenExistenceJWT(req){
        
        userToken = req.cookies.catalogtoken || req.headers.authorization;
        if(userToken){
            console.log(userToken+"<<<<<<userToken>>>>>>>");
            return true;
        }else{
            return false;
        }
    }

    decryptJWT(){
        userToken = userToken.split(" ")[1];
        try {
            const userJWTPayload = jwt.verify(userToken, SECRET);
            return userJWTPayload;
        } catch (error) {
            return error;
        }

    }

    checkRefreshToken(token){
      console.log('function checkRefreshToken---->>>>>>>> ',token)
        return new Promise((resolve,reject) =>{
        userToken = token;
        resfreshtokenmodel.get(userToken)
        .then((refresh) => {
            if(refresh.status === "ACTIVE"){
                console.log(" function checkRefreshToken====refresh.acccountId:::",refresh.accountId)
                resolve(refresh.accountId);
            }else{
                reject(false);
            }
        })
        .catch((error => {
            reject(error);
        }))
        })
    }
    decryptRefreshToken(accIDFromRefreshToken){
        console.log("function decryptRefreshToken:::",accIDFromRefreshToken);
         let encryptAccIDFromRefreshToken=this.encrypt(accIDFromRefreshToken)
        const acc_id = jwt.verify(userToken, SECRET);
        console.log('jwt acc_id--->>', acc_id);
        if(acc_id){
         if(encryptAccIDFromRefreshToken === acc_id.accountId){
            return acc_id;
        }else{
            return false;
        }
        }
        else{
            return false;
        }


    }
    decryptToken(token){
        const account_id=jwt.verify(token,SECRET)
        console.log("account_id::::&&",account_id)
        if(account_id.accountId){
            return account_id.accountId;
        }else{
            return false;
        }
    }
    /*decrpt function return decrypted value*/
    decrypt(data) {
    try {
      const algorithm = 'aes-192-cbc';
      const key = crypto.scryptSync('onetoone', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted =
        decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
  
      return decrypted;
    } catch (e) {
      return data;
    }
  }
  
  encrypt(data) {
    try {
      const algorithm = 'aes-192-cbc';
      const key = crypto.scryptSync('onetoone', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
      console.log(encrypted);
      return encrypted;
    } catch (e) {
      return data;
    }
  }
}

module.exports = JwtToken;
