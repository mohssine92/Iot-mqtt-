const { validationResult } = require("express-validator");



/* un middle no es nada que una funcion 
 * necesito lanzar un error si no esta cumpliendo con el express validator ,y para esto es Validacampos  
*/
const validarCampos = (req, res, next) => { // conocido como mdlr perzonalizado 
  
  // errores acumulados en req , con los middelware de express-validator , si no se acmular nada pues sera empty
  const errors = validationResult(req);
  if( !errors.isEmpty() ){
    return res.status(400).json(errors); 
  }

  /* si no returna respuesta de errores , pues pasamos a la ejecuccion del siguiente instruccion es lo que hace exactamente esta funcion de next. , sigiente 
     funcion manteniendo la data entrante para seguir su viaje hacia el controller el que lo va a procesar o sabra lo que tiene que hacer :D  */
   next();

}


module.exports = {
  validarCampos
}