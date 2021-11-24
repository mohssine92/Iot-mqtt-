const { response, request } = require('express');
const jwt = require('jsonwebtoken');



// capa validacion ,  Middelware perzonalizado  se dispara con 3 args 
const validarJWT = async( req = request, res = response, next ) => {  // res = response para tener el tipado tener ayuda al escribir
 
    const token = req.header('x-token'); // console.log(token);
    
    if ( !token ) {  // primer o verificar si llega el token 
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
       
        const payload = jwt.verify( token, process.env.SECRETORPRIVATEKEY ); // console.log(uid);
        
        
         //console.log('``````````')
         //console.log(uuid)
         //console.log('``````````````')

         req.user = payload;
     
     

        next();
         
    } catch (error) {
        
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

   
}




module.exports = {
    validarJWT
}