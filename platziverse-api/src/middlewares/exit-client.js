const { response,  request } = require('express')


const existeCliente = ( req, res = response, next ) => {

    // req.usario : se asigna en el mdlt de jwt

     console.log(req.uuid);
    
    
   // if ( !req.usuario ) {
   //     return res.status(500).json({ // 500 falla algo en mi codigo
   //         msg: 'Se quiere verificar el role sin validar el token primero'
   //     });
   // }

    // TODO aqui no usamos porque lo tenemos implemetado en el controlador alo mejort lo madamos despues

    next();
}



module.exports = {
    existeCliente
}