const Config = require("../../config/config");
const httpUtility = require("../helpers/httpUtility");
const qs = require("querystring");
const _user = require("./user.model");
const crypto=require('crypto');
class userDataToCMS {
  constructor(doc) {
    this.doc = doc;
    this.httpModule = new httpUtility();
  }

  send() {
    return new Promise(async (resolve,reject) => {
      const data = this.getDataFromDoc();
      const options = this.getOptionsForURL();
      try {
        console.log("cms data -->>>",data);
        if(Config.cms_url){
          const res = await this.httpModule.post(options, data);
          resolve(res)
        }else{
          resolve()
        }
      } catch (error) {
        console.error("Error in posting user data to CMS ", error);
        reject(error);
      }
    })
  }
  decrypt(data) {
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)
  
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
      // console.log(decrypted)
      return decrypted;
    }
    catch(e) {
      return data;
    }
  };

  getDataFromDoc() {
    return qs.stringify({
      apiKey: Config.cms_api_key,
      entityId: this.doc.account_id.domain.cmsId,
      uuid: this.doc._id.toString(),
      firstname: this.doc.account_id.first_name? this.doc.account_id.first_name.split(" ")[0]
        : this.doc.account_id.first_name,
      lastname: this.doc.account_id.first_name ? this.doc.account_id.first_name.split(" ")[1]
        : "",
      userName: "",
      email: this.decrypt(this.doc.account_id.email),
      phone: this.decrypt( this.doc.account_id.phone),
      employee_code : this.doc.account_id.employee_code?this.doc.account_id.employee_code:"",
      qr_code : this.doc.account_id.qr_code?this.doc.account_id.qr_code:"",
      gender: this.doc.gender,
      language: this.doc.language? this.doc.language[0] : '',
      location: this.doc.location,
      source:"App",
      isActive:this.doc.account_id.activated,
      appId :this.doc.appId[0],
      userAccountType:this.doc.userAccountType,
      authenticationType:this.doc.userAuthType
    });
  }

  getOptionsForURL() {
    return {
      hostname: Config.cms_url,
      path: "/api/integration/adduser",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":"1to1help"
      },
    };
  }
}

module.exports = userDataToCMS;
