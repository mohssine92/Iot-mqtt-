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


// dbServicios, que este forma de trabajr con db , podemos crear archivos mdlrs que hacen conectar a diferentes modulos db 
// asi tendremos conexion a Varios dbs - y cada endpoint tiene libertad de implementar el modulo de db que le conviene siguiendo el misma arquetectura