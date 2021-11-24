'use strict'

const jwt = require('jsonwebtoken')



function sign (payload, secret, callback) {
  jwt.sign(payload, secret, callback)
 
 
 // jwt.sign(payload, , callback)


}



module.exports = {
  sign
 /*  verify */
}

// vide 48 crear token en cosola para aprobarlo