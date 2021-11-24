const express = require('express')
var cors = require('cors');
const { config } = require('platziverse-tools')
const chalk = require('chalk');

const { errorhandler } = require('../middlewares/errorhandler');
const { dbConnection } = require('../db/db');







// Tratar servidor como objeto 
// Express basado en classes
class Server {


  //es inecesario declarar la props , basta declaralos en el constructor
   constructor(){
     // express() es la funcion servidor
     this.app = express();   
     this.port = config.apiPort 

    /* Definir urls ApiRest en el servidor de node , sino la defino no estara reconocida por mi servidore 
       cada ruta dispone de endpoints propios = archivos de routes , la suma de todos seria los endPoints de RestApi */
    this.paths = {
      agents:   '/api/agents',
      metrics:  '/api/metrics',
      
    }
    this.services = null;

    
    // conectar a db obtener servicios
     this.connectarDB();

    // Middelwares : funciones a nivel del servidor de express  : se ejecutan antes de llegar a las rutas
     this.middlewares();

    // Rutas de mi aplicacion 
     this.routes();

     this.errorHandler();

   }

   async connectarDB() {
    // aqui se implemeta varias conexiones a base de datos diferentes usar una o otra ... 
     await dbConnection(this.services); 
  }

    

   /* aqui tenemos agrupados lo que son mdlrs a nivel de servidor */
   middlewares(){
     // app.use() es los middelware de express ver mas informacion en la doc de express ..
     // Cors , donde configuramos las cabezeras como los origines que tiene permioso a comunicar a los end-points del Restserver , 
     // Rest-server pude ser publica , o solo para algunosorigenes ...hay varios escenarios que pudede configura
     this.app.use( cors() );

     /* Lectura y parseo del body disparado por Origen o navigador o postman por cliente  hacia todos nuestros end-points en esta configuracion 
      Ex : un formulario dispara su post en este especifico punto codificamos valor req.body en formato json , en objeto json literal - apto a manipular en js  */
     this.app.use( express.json() );  
     
     
     
  
    //http://localhost:8080 - pagina statica a cargar en el dominio - express funcion paquete 
     //this.app.use(express.static('public'));

     /* FileUpload - carga de archivos  - video:182 para cualquier duda 
      * puede ser cualquier tipo de  archivo - aqui no es el luguar donde estoy especificando que tiene que ser img o excel ....
     */
     
   } 

   routes() { 
    /* middelware de express , segun this.paths entrante se require  el archivo de rutas : verbos http relacionado */
    this.app.use( this.paths.agents, require('../routes/agents'));
    this.app.use( this.paths.metrics, require('../routes/metrics')); 

   }
   
   // manejador global  de errs que surgan en el proceso de controller  
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