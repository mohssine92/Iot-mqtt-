const express = require('express')
var cors = require('cors');
//const { config } = require('platziverse-tools')
const chalk = require('chalk');

const { errorhandler } = require('../middlewares/errorhandler');
const { dbConnection } = require('../db/db');


class Server {

   constructor(){
    
     this.app = express();   
     this.port = process.env.apiPort

    this.paths = {
      agents:   '/api/agents',
      metrics:  '/api/metrics',
      
    }
    

    // conectar a db obtener servicios
     this.connectarDB();
     // conectar a otros dbs .....

    // Middelwares : funciones a nivel del servidor de express  : se ejecutan antes de llegar a las rutas
     this.middlewares();

    // Rutas de mi aplicacion 
     this.routes();

     this.errorHandler();

   }

   async connectarDB() {
    // aqui se implemeta varias conexiones a base de datos diferentes usar una o otra ... 
     await dbConnection(); 
  }

    

   /* aqui tenemos agrupados lo que son mdlrs a nivel de servidor */
   middlewares(){
    
    // use es funcion de express para montar mdlrs
     this.app.use( cors() );

     /* Lectura y parseo del body disparado por Origen o navigador o postman por cliente  hacia todos nuestros end-points en esta configuracion 
      Ex : un formulario dispara su post en este especifico punto codificamos valor req.body en formato json , en objeto json literal - apto a manipular en js  */
     this.app.use( express.json() );  
     
   } 

   routes() { 
     // montar routers atraves de mdlrs 
    this.app.use( this.paths.agents, require('../routes/agents'));
    this.app.use( this.paths.metrics, require('../routes/metrics')); 
    // montar routers para otros controladores conectados a otros dbs segun proyecto crezca .... versiones del API

   }
   
   // manejador global  de errs que surgan en la ruta , montado por mdlr de express 
   errorHandler () {
     this.app.use( errorhandler )
   }

  listen() {
   this.app.listen(this.port, () => {
    console.log(`${chalk.red('[platziverse-api]:')} server listening at http://localhost:${this.port}`)
   
   })

  }


  
}


module.exports = Server;