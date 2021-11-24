const { Router }= require('express');
const { GetAgents, GetAgent } = require('../controller/agents');


const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');



// acumulador de err de mdlrs de express
//const { validarCampos } = require('../middlewares/validar-campos');






// Router funccion extraeda del paquete express 
const router = Router();

router.get('/', [ 
  validarJWT,
  validarCampos
], GetAgents );
router.get('/:uuid',[
  validarJWT,
  validarCampos
] ,GetAgent );






module.exports = router;

// seguridad : mdlr passport js investigar 