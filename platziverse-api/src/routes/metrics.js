const { Router }= require('express');
const { Getmetrics, GetmetricsAgentType } = require('../controller/metrics');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');
const { permissions } = require('../middlewares/permissions');


// Router funccion extraeda del paquete express 
const router = Router();



// metrics de un agent en especifico 
router.get('/:uuid',[
  validarJWT,
  permissions('metrics:read','VENTAS_ROLE'), // venta rol para saber si puede ajustar varios permisos
  validarCampos
] , Getmetrics );

// metricas de un agente en un tipo en especifico 
router.get('/:uuid/:type',[
  validarJWT,
  validarCampos  
], GetmetricsAgentType );



module.exports = router;


