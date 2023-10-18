const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const { loginVerify } = require('../account/account.controller');
const Schema = mongoose.Schema;

//******** */ added for company ******************
/**
 * Domain Schema
 */
const DomainSchema = new mongoose.Schema({
    company: {
        type: String
    },
    domain_id: {
        type: Schema.Types.ObjectId,
        ref: "_domain",
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

    verifyCompany(condition) {
        console.log(condition + " =>condition in verifyEmployee");
        return this.find(condition)
            // .populate('domain')
            .then((company) => {
                console.log(company + " company in then ");
                if (company) {
                    console.log(company + " => company in if");
                    return company;
                }
                const err = new APIError('No such company exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },

    list() {
        console.log("list of function in company");
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
module.exports = mongoose.model('_company', DomainSchema);
