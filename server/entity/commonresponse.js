const responseCb = (body) => {

    return !body?{
        "body":null,
    }:{
      
       "body":body
    }
  }
  
  const headerCb = ({ code }) => {
    return {
      "code": code,
    }
  }
  
  const bodyCb = ({ val, err,code }) => {
    return {
      "code": !code ? null : code,
      "value": !val ? null : val,
      "error": !err ? null : err

    }
  }
  
  
  module.exports = {
    headerCb,
    bodyCb,
    responseCb
  }