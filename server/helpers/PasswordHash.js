  const bcrypt = require("bcrypt");
const config = require("../../config/config");
let saltingRounds;
class PasswordHash {
  constructor() {
    saltingRounds = config.saltingRounds;
  }

  async hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt
        .hash(password, saltingRounds)
        .then(function (hash) {
          resolve(hash);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async validatePassword(password, userpwd) {
    console.log("validatePassword--->>>>>>>>>>>>>>>>>>")
    console.log(password)
    console.log(userpwd)
    const deHashed = await bcrypt.compare(password, userpwd);
    return deHashed;
  }
}

module.exports = PasswordHash;
