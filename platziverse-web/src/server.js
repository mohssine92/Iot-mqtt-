 'use strict'


const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path') // this modul is recomended for do operation with system root files is compatible with windos and linux 
const express = require('express')
const socketio = require('socket.io')

const PlatziverseAgent = require('platziverse-agent') // requerimos la clasee -nuestro egente de monitoreo

const chalk = require('chalk')

const {
  utils: { handleFatalError },
  //config
} = require('platziverse-tools')

//Variables de entorno -para poder tener variables del entorno seguras
require('dotenv').config();


const app = express() // instanciar express
const server = http.createServer(app) // crear server http 
const port = process.env.PORT;
const io = socketio(server)

// esta instancia no va monitorear asi no pasamos nada : de valores de configacion 
// por ahora solo quiero recibir informacion que la nformacion que van a transmitir otros agentes
const agent = new PlatziverseAgent()



// mdlr
app.use(express.static(path.join(__dirname, '../public'))) //__dirname : directorio de ejecucion de este script





// manejo de conexiones con socket.io
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  // digamos quiero recibir del agente object event emmiter y voy restrubuir al socket
   
   agent.on('agent/connected', payload => {
      socket.emit('agent/connected', payload)
   })
 
   agent.on('agent/message', payload => {
     socket.emit('agent/message', payload)
   })
 
   agent.on('agent/disconnected', payload => {
     socket.emit('agent/disconnected', payload)
   })
   
})


process.on('uncaughtException', handleFatalError) // si no hacemos manejo de excepciones tanto llamadas async y promesas
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
  // asi el servidor se levanto conecto al agente asi puede pasar a recibir mensajes
  //agent.connect();

  

  

   
   // asi la mapa tendra tres funciones - asi un agente genera 3 metricas por 1s durante periodo de su conexion 
   
   agent.connect()
   
   // These are the methods expose by this agent instance
   //agent.on('connected', eventHandler) //
   //agent.on('disconnected', eventHandler) // my desconected
   //// agent.on('message', eventHandler)
   //
   //// This methods are for other agents
   //agent.on('agent/connected', eventHandler) // when mqtt broker send infs disconected of other client
   //agent.on('agent/disconnected', eventHandler)
   //agent.on('agent/message', eventHandler) //!!
   
   // eventHandler function to be execute in each event
   function eventHandler(payload) {
     console.log(payload)
   }
   
  
  
}) 

