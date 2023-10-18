const _account = require("../account/account.model");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const JwtToken = require("../helpers/JWTTokenHandler");
const memberAccount=require('../memberAccount/memberAccount.module')
const crypto=require('crypto')

const err = new APIError("Authentication error", httpStatus.UNAUTHORIZED, true);

/**
 * Returns 200 if the token is valid
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function validate(req, res, next) {
console.log("validate function called in auth")
  let jwt = new JwtToken();
  let verifyTokenExistence = jwt.verifyTokenExistenceJWT(req);
  if (!verifyTokenExistence) {
    next(err);
    return;
  }
  let payload = jwt.decryptJWT();
  console.log("payload:::",payload)
  if(payload && payload.name === "JsonWebTokenError") {
    res.status(httpStatus.UNAUTHORIZED).send(payload);
    return;
  }
  let decryptMemberId=decrypt(payload.memberId)
   console.log({decryptMemberId})
  memberAccount
    .findOne({memberId:decryptMemberId})
    .then((user) => {
      if (user) {
        res.status(httpStatus.OK).send();
      }else{
      res.status(httpStatus.UNAUTHORIZED).send();
      }
    })
    .catch((e) => next(err));
}

/**
 * It will get the new refresh token along with the access token
 * @param req
 * @param res
 * @returns {*}
 */
async function getrefreshtoken(req, res,next) {
  let refreshToken = req.query.refreshtoken;
  let refreshJwt = new JwtToken();
  let accIDFromRefreshToken;
  try {
    console.log("refreshToken::",refreshToken)
     accIDFromRefreshToken = await refreshJwt.checkRefreshToken(refreshToken);

  console.log("accIDFromRefreshToken:::::::::::",accIDFromRefreshToken)
  let payload = refreshJwt.decryptRefreshToken(accIDFromRefreshToken);
  if (!payload) {
    next(err);
  }
  console.log("payload::::::::",payload)
  let decryptAccountId=decrypt(payload.accountId)
  memberAccount
    .findOne({accountId:decryptAccountId})
    .then(async (user) => {
      if (user) {
        console.log("user:::::::",user)
        try {
          let tokenObj = {};
          let encryptAccountId=encrypt(user.accountId)
          let encryptMemberId=encrypt(user.memberId)
          tokenObj.jwt = refreshJwt.getJWTToken(encryptAccountId,encryptMemberId);
          tokenObj.refreshToken = await refreshJwt.getRefreshToken(encryptAccountId,encryptMemberId);
          res.status(httpStatus.OK).json(tokenObj)
        } catch (error) {
          const err = new APIError(
            "Internal server error, Unable to generate token",
            httpStatus.INTERNAL_SERVER_ERROR,
            true
          );
          next(err);
        }
      }
    })
    .catch((e) => next(err));
  } catch (error) {
    console.error("Error when fetching the refresh token " + error)
    next(err)
  }
}
/*decrpt function return decrypted value*/
function decrypt(data) {
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
//--------------------------------------------------------------------//
/*encrpt function return encrypted value*/
function encrypt(data) {
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
//--------------------------------------------------------------------//

module.exports = { validate, getrefreshtoken };
