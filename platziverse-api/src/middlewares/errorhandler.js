const debug = require('debug')('platziverse:api:mddlewares')


const errorhandler = (err, req, res, next) => {
  /* la idea en las acciones controladores implementamos instancia de err , nos va dar unb mesage de err 
     asi lo emitimos atraves de la funcion  next y lo obtenemos aqui - siguienta la tactica hacemos match a tipos 
     de mensajes de errs y construimos respuesta condicionalmente */

    debug(`Error: ${err.message}`)

    if (err.message.match(/not found/)) {
      return res.status(404).json({ error: err.message })
    }
  
    res.status(500).json({ error: err.message })


}


module.exports = { 
 errorhandler  
}
