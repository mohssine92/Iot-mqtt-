


const express = require('express'); 

const { SERVER_PORT } = require('../global/environment');


const router = require('../routes/router');

const socketIO = require('socket.io'); 
const http = require('http');
const socket = require('../sockets/socket'); 
const cors = require('cors')
const chalk = require('chalk')

// recordar agent puedo usar para lectura y monitorear data - en este server usamos solo lectura
const platziverseagent = require('platziverse-agent')

const { pipe } = require('../utils/utils')

const proxy = require('../proxy')
const asyncify = require('express-asyncify') 

const { errorhandler } = require('../middlewares/errorhandler');



class Server {

     
    constructor() {

      this.app = asyncify(express()); // asi las rutas y mdlrs supportan sync await 
      this.port = SERVER_PORT;
      this.Router = null; 
      this.httpServer = new http.Server( this.app );
      this.io = new socketIO.Server( this.httpServer, { cors: {origin: true, credentials:true} } ); 
      // solo recibir la informacion que van a transmetir otros agentes  : esta app no va monitorear 
      this.agent = null;
      
      this.middlewares();
      this.router();
      this.routes();
      this.errorHandler();
      this.AgentEventEmmiter();
      this.escucharSockets(); 

    }
     
    
    middlewares() {
      
     this.app.use(cors())

     this.app.use( express.json(['http://localhost:4200/', 'http://example2.com']
     ) );
    }

    router() {
      // en el server de ts trabajamos con singlton : aqui no pudimos implmentar singlton , asi esta funcion le paso server de socket y me returna el 
      // router como tal 
      this.Router = router(this.io)
    }


    routes(){
      // TODO: algun funcion le paso io arg y me returna router : tengo problemas con singlton 
      this.app.use('/', this.Router ); //
      this.app.use('/v1/', proxy)
    } 
    
    errorHandler () {
      this.app.use( errorhandler )
    }

    AgentEventEmmiter () {
      // integracion solo lectura de otros instancia de platziverseagent - integracion agente monitoreo y socket io 
      this.agent = new platziverseagent(); 
      this.agent.connect()

      // pipe todos eventos agente los envia al socket 
      pipe(this.agent, this.io);



    }

    escucharSockets(){

      console.log(chalk.bgRed('Escuchando conexiones - sockets'));
     
      this.io.on('connection', cliente => { 

          // FERNANDO HERRERA SOCKET     
          // cuando tarabajo con cliente socket y server io 



          // any client connected to this server api - socket 
          console.log(chalk.bgBlue('id cliente : '),chalk.underline(cliente.id))

          // conectar cliente socket 
          socket.conectarCliente( cliente , this.io );


          //  configurar usuario
          socket.configurarUusuario( cliente , this.io );

          // Obtener usuarios activos
          socket.obtenerUsuarios( cliente, this.io );

          // Mensajes
          socket.mensaje( cliente , this.io );

          // Desconectar
          socket.desconectar(cliente, this.io)

          // // TODO - mapas dur borrado por comits 
         







          
         
      });






    }

    
    start( callback ) { // !!!
      this.httpServer.listen( this.port, callback ); 
    }

}



module.exports = Server;
