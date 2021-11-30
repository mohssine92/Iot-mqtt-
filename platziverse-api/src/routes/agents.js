const { Router }= require('express');
const { GetAgents, GetAgent } = require('../controller/agents');


const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const guard = require('express-jwt-permissions')() // requerir y llamar como funcion 






const router = Router();

router.get('/', [ 
  // mdlrs independientes de ruta ...
  validarJWT, // concepto autenticacion jwt 
  validarCampos, // handler de la ruta 
  // modulo para permisos que viajan dentro de jwt : 50 - no hace falta disparrlo antes de validarCampos : funciona con errorHandler mdlr xpress
  guard.check(['metrics:read']) // [permisos .... ] concepto autorizacion jwt 
], GetAgents ); // controller

router.get('/:uuid',[
  validarJWT,
  validarCampos
] ,GetAgent );





module.exports = router;

// seguridad : mdlr passport js investigar 