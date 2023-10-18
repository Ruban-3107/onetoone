const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');
const { required } = require('joi/lib/types/lazy');

/**
 * Domain Schema
 */
const SponsorSchema = new mongoose.Schema({
    sponsorId: {
        type: String,
        required: true
    },//from excel
    sponsorName: {//1
        type: String
    },//from excel
    sponsorType: {//2
        type: String,
        required: true
    },//from excel
    agreementList: [
        {
            agreementId: {
                type: String,
                required: true
            },
            agreementEntityName: { type: String },
            agreementDate: { type: Date },//from excel
            startDate: {
                type: Date,
                required: true
            },//from excel - assuming (should come from excel)
            endDate: {//from excel
                type: Date,
            },
            validity: { type: String },//from excel - asssuming
        }
    ],
    billingDetails: {
        subscriptionAmount: {
            amount: { type: String },
            denomination: { type: String }
        },//from excel
        subscriptionFrequency: { type: String },//from excel - asssuming
        currency: {
            amount: { type: String },
            denomination: { type: String }
        },//from excel - asssuming
        billingFrequency: { type: String },//from excel - asssuming
        billingDay: {
            type: String,
            //default: Date.now
        },//from excel - asssuming
        gstinNumber: { type: String },//from excel - asssuming
        needPO: { type: Boolean },//from excel - asssuming
        creditPeriod: { type: String },//from excel - asssuming
        payinAdvance: { type: Boolean },//from excel - asssuming
        billingEntities: [
            {
                enitityName: { type: String },
                entityAmount: { type: Object },
            },
        ],
    },
    subscriptionDetails: {
        startDate: {//from excel
            type: Date,
            // default: Date.now
        },
        endDate: {//from excel
            type: Date,
            // default: Date.now
        },
        subscriptionStatus: { type: String },
    },
    sponsorReporting: {//3
        type: Object
    }
});


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

// SponsorSchema.plugin(idvalidator);

/**
 * Methods
 */
SponsorSchema.method({
});

/**
 * Statics
 */
SponsorSchema.statics = {
    verifySponsorId(condition) {
        return this.find(condition).then((sponsorId) => {
            if (sponsorId) {
                console.log("sponsorId==> ", sponsorId);
                return sponsorId;
            }
            else {
                return new APIError(error,httpStatus.NOT_FOUND)
            }
        })
    }
}
// /**
//  * @typedef Domain
//  */
module.exports = mongoose.model('sponsor', SponsorSchema);



/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

// SponsorSchema.plugin(idvalidator);

/**
 * Methods
 */
SponsorSchema.method({
});


//  * @typedef Domain
//  */
module.exports = mongoose.model('sponsor', SponsorSchema);