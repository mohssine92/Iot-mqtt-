const debug = require('debug')('platziverse:api:mddlewares')


const errorhandler = (err, req, res, next) => {
   // mdlr de manejo de errores 

    debug(`Error: ${err.message}`)


    if (err.message.match(/not found/)) { // match tiene en algun parte algo diga 
      return res.status(404).json({ error: err.message })
    }

    

    // if() ...if.. segun implementamos : disparamos errores 





    // por defecto si llega err vamos a devolver 
    res.status(500).json({ error: err.message })


}


module.exports = { 
 errorhandler  
}
