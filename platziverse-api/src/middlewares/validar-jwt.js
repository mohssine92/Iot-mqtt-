const { response, request } = require('express');
const jwt = require('jsonwebtoken');



// capa validacion ,  Middelware perzonalizado  se dispara con 3 args 
const validarJWT = async( req = request, res = response, next ) => {  // res = response para tener el tipado tener ayuda al escribir
 
    const token = req.header('apiToken'); // console.log(token);
    
    if ( !token ) {  // primer o verificar si llega el token 
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
       
        const payload = jwt.verify( token, process.env.SECRETORPRIVATEKEY); // console.log(uid);
      
         req.user = payload;
     
     

        next();
         
    } catch (error) {
        
   
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

   
}




module.exports = {
    validarJWT
}