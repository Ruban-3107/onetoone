const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const { loginVerify } = require('../account/account.controller');
const Schema = mongoose.Schema;

/**
 * Domain Schema
 */
const DomainSchema = new mongoose.Schema({
  domain: {
    type: Array
  },
  company_name: {
    type: String
  },
  appId: {
    type: Array
  },
  authenticationType: {
    type: Array
  },
  qr_code: {
    type: String
  },
  cmsId: {
    type: String
  }
});



/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
DomainSchema.method({
});

/**
 * Statics
 */
DomainSchema.statics = {
  //   /**
  //    * Get domain
  //    * @param {ObjectId} id - The objectId of user.
  //    * @returns {Promise<User, APIError>}
  //    */

  verifyDomain(condtion) {
    console.log("verifyDomain called");
    return this.find(condtion)
      .then((domain) => {
        if (domain) {
          console.log("Domain in verifyDomain =>" + domain);
          return domain;
        }
        const err = new APIError('No such domain exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  searchDomainByName(name) {
    console.log("searchDomainByName called");
    return this.find({ 'company_name': { '$regex': name, '$options': 'i' } })
      .then((domain) => {
        console.log("Domain in verifyDomain =>" + domain);
        return domain;
      });

  },

  getDomain(id) {
    console.log("getDomain called");
    return this.findById(id)
      .then((domain) => {
        if (domain) {
          console.log("Domain in verifyDomain =>" + domain);
          return domain;
        }
        const err = new APIError('No such domain exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  list({ skip = 0, limit = 50 } = {}) {
    console.log("list of function");
    // console.log(JSON.stringify(this.find())+"=>>>>>>>find()");
    return this.find()
      // .sort({ createdAt: -1 })
      // .skip(+skip)
      // .limit(+limit)
      .exec();
  }
};

// /**
//  * @typedef Domain
//  */
module.exports = mongoose.model('_domain', DomainSchema);
