const _domain = require("../domain/domain.model");
const _account = require("./account.model");
const APIError = require("../helpers/APIError");
const PasswordHash = require("../helpers/PasswordHash");
const { Domain } = require("../helpers/domain.list.enum");
const httpStatus = require("http-status");
const crypto = require("crypto");
class accountRequestWrapper {
  constructor(req) {
    this.body = req.body;
  }

  async wrap(next) {
    try {
      const { phone , email , employee_code , qr_code} = this.body ;
      let condition = [];
      const phoneEncrypted=await this.encrypt(phone)
      const emailEncrypted=await this.encrypt(email)
      if(phoneEncrypted)condition.push({'phone':phoneEncrypted});
      if(emailEncrypted)condition.push({'email':emailEncrypted});
      if(employee_code)condition.push({'employee_code':employee_code});
      if(qr_code)condition.push({'qr_code':qr_code});

      await this.checkDuplicates(condition)

      // this.body.password = await this.wrapUserPassword();
      this.body.domain = await this.wrapUserDomain();
      next();
    } catch (error) {
      next(error);
    }
  }

  checkDuplicates(condition){
    return new Promise((resolve, reject) => {
      _account.findOne({$or : condition}).then(async(user) =>{
        if(user){
          const DomainDetails = await _domain.getDomain(user.domain);
          let email = user.email ? user.email:"N/A";
          let employee_code = user.employee_code ? user.employee_code:"N/A";
          let qr_code = user.qr_code ? user.qr_code:"N/A";

          let message = "user already exists,"+"company Name:"+DomainDetails.company_name+","+"cmsId :"+DomainDetails.cmsId+","+"uuid:"+user._id+","+ "phone:"+user.phone+",email :"+email+", "+
          "employee_code:"+employee_code+","+"qr_code:"+qr_code;
          reject(
            new APIError(message, httpStatus.NOT_FOUND)
          );
        }else{
          resolve();
        }
      })
    })
  }

  wrapUserDomain (){
    return new Promise(async (resolve, reject) => {
      if ((this.body.cmsData === true || this.body.cmsData == 'true' ) && this.body.entityId) {
        console.log('inside domain data ---->>>',this.body.entityId)
        _domain
          .findOne({ cmsId: this.body.entityId })
          .then((domain) => {
          console.log(" domain details", domain)
            if (domain && domain._id) {

              resolve(domain._id);
            } else {
              reject(
                new APIError("No such domain exists", httpStatus.NOT_FOUND)
              );
            }
          })
          .catch((error) => reject(error));
      } else reject(
      new APIError("entity is mandatory", httpStatus.NOT_FOUND)
    );
    });
  };
   encrypt(data){
    try {
      
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);
   
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      const encrypt = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
      console.log("function:encryptphone:",encrypt)
      return encrypt
    } catch(e) {
      return data;
    }
  }
}
module.exports = accountRequestWrapper;
