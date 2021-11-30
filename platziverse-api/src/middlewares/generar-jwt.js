'use strict'

const jwt = require('jsonwebtoken')



const sign = async (payload, secret ) => {

   // jwt.sign(payload, secret, callback)  clg

   const sign = await jwt.sign(payload, secret)
   return sign

}



module.exports = {
  sign

}


 // uso de funcion de generacion de jwt - en cualquier controler o ruta para genracion de apikey en este caso jwt
    //  const token = await sign({username: 'mohssine' }, 'platzi')
    //  console.log( '==>',token);

