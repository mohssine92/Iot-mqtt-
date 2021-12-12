'use strict'

const net = require('net')
const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const db = require('platziverse-db')
const {
  //config,
  utils: { parsePayload, handleFatalError, handleError },
  //config
} = require('platziverse-tools')



// Aedes is a barebone MQTT server that can run on any stream servers - aedes es el modulo que nos va permitir implementar seervidor mqtt
// See https://github.com/moscajs/aedes
// redisPersistence to make aedes backend with redis
// https://www.npmjs.com/package/aedes-persistence-redis
const redisPersistence = require('aedes-persistence-redis')


/* implementacion del servidor mqtt usando aedes y aedes-persistence-redis
 * este servidor mqtt funcionaria como message broker - recordar hay muchos servidores mqtt : message broker que puede integrar
   en el proyecto y usar , hay gratuitos o de pago .
   -- usar db redis no relacinal - para almacenamiento de data antes que la distrubucion de la misma a los sub , tambien lo mantiene si pasq algun crash en server mqtt en produccion .
*/
// NUESTRO MESSAGE BROKER - usa Como BACKEND db redis no relacinal 
const aedes = require('aedes')({

  persistence: redisPersistence({
    port: 6379, // port redis db
    host: '127.0.0.1',
    family: 4,
    maxSessionDelivery: 100
  })

})

// The server is implemented with core module `net` that expose a createServer method
// The net module provides an asynchronous network API for creating stream-based
// TCP or IPC servers (net.createServer()) and clients (net.createConnection()).
// See https://nodejs.org/api/net.html#net_event_connection
const server = net.createServer(aedes.handle)

/* este Objeto Server  es de tipo event emmiter
 * asi cada vez trabajamos con event emiter debemos manejar los errores
*/ /// servidor mqtt corre en puerto 1883
server.listen(1883, (error) => {
  if (!error) {
    console.log(`${chalk.redBright('[platziverse-mqtt]:')} server MQTT is running in port: 1883`)

  } else {
    handleFatalError(error) // manejo de errores
  }
})



// Mapa de js ppara mantener refrencia de estoes agentes 
const clients = new Map()
// mis servicios definidos de manera global - luego los seteo 
let AgentService
let MetricService


// motivo porque eset objeto aqui porque me toma en cuenta las variables de entorno en index del servidor modul 
const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || '123456',
  host: process.env.DB_HOST || 'localhost',
  port : process.env.PORT || 5433,
  dialect: 'postgres',
 // para ver debug de modulo inteno modulo db ,hay que configuar variable DEBUG bien en script en package.json . name space tambien
  logging: s => debug(s),
  //setup: true  recordemos esta prop borra la db : asi si la dejo en true  borra toda la db cada vez arrancamos el servidor mqtt
  //nosotros no el servidor puede caer y levantar y mantenemos la db : conectar u¡ ya esta no borrar la db y reinstalar de nuevo 
} 

// es punto alto en servidor mqtt - extraego los servicios que va requerir el message broker
server.on('listening', async () => {

   try {
      // instanciar la db modul o obtecion de los servicios 
      const {Agent , Metric } = await db(config)
      AgentService = Agent
      MetricService = Metric 

   } catch (error) {
     // handleFatalError termina proceso , si servidor no es capaz de levantar la db terminamos el proceso 
     handleFatalError(error)

   }

})


/// when any  client mqtt connected to server mqtt
aedes.on('client', (client) => {
  // ese id autogenerado por mqtt (lo maneja mqtt internamente )
  debug(`[client-connected]: ${client.id}`)
})


// message broker aedes recibe message atraves de un client mqtt  :
// que paquete recibimos , que cliente mando ese paquete
// payload json stringfy valido : ‘{“hello”:“platziverse”}’ 
aedes.on('publish', async (packet, client) => {

  
   switch (packet.topic) {

     case 'agent/message':

     debug(`[payload]: ${packet.payload}`) 
        
     const payload = parsePayload(packet.payload)

     if (payload) { // en caso de estrucura mal regresa nul : no entarr , si objeto vacio sera : err payload.agent property undefined 
   
       let agent

       
       try {
         agent = await AgentService.createOrUpdate({
           // copy the agent and set the property `connected: true`
           ...payload.agent, // desestructurar props del object agent 
           admin : true,
           //connected: true // is connected
          })
          debug(`[saved-agent]: ${agent.id}`)
   
       } catch (error) {
         
        return handleError(error)
         // no termina el proceso : sale del catch y termina la ejecuccion de codigo  . - fatala mata  a el proceso . no termna la ejeccuccion de codigo 
       }

         // if doesn't exist store the agent - Notify any agent is Connected 
        if (!clients.get(client.id)) {
          // almazenar en la mapa 
         clients.set(client.id, agent)
         console.log( 'mapa',clients.get(client.id));
        
         // publish : broadcast a todos los clientes mqtt que estan conectados y estan  escuchando al topic event 
         aedes.publish({
           topic: 'agent/connected',
           payload: JSON.stringify({
             agent: {
               uuid: agent.uuid, // agent objeto json regresado por servicio db
               name: agent.name,
               hostname: agent.hostname,
               pid: agent.pid,
               admin: agent.admin,
               connected: agent.connected
             }
           })
         })
       }

        // save metrics on db 
        try {
           const promises = payload.metrics.map(async (metric) => {
             // TODO: almacenamiento en este caso es  serial objeto por objeto si el agente tiene 20 o 30 metrica esto toma tiempo , podemos guardar coleccion como tal en prop asi sera mas rapido . 
             const createdMetric = await MetricService.create(agent.uuid, metric)
             return createdMetric
           })
   
           const resolvedPromises = await Promise.all(promises)
   
           resolvedPromises.forEach((metric) => {
             debug(
               `[saved-metric]: Metric ${metric.id} saved with Agent ${agent.uuid}`
             )
           })
   
         } catch (error) {
   
          return handleError(error)
   
         }
   
     }
     
       break;

      case 'agent/example': // diferents topics -......
        console.log('12');
       break;
   
     default:
      debug(`[payload]: ${packet.payload}`)
       break;
   }
 


})


// any client mqtt disconnected
aedes.on('clientDisconnect', async (client) => {
    // NB :  comportamiento por defecto al usar clienet mqtt consola , se conecta y desconecta en breve asi se dispara  clients.get(client.id) antes  clients.set(client.id) en scop message 
    // la logica con clientes mqtt que vamos a manejar debemos mantener cliente conectado controlamos nuestra logica de conexion del mismo  cuando queramos asi cuando solicita maps.get lo encuentra . 
    // en resumen so no lo encuentra nunca llega a actualizar db : connected false . 
   
    debug(`[client-disconnected]: ${client.id}`)

    // Try to find the client in the clients connected list map js
    const agent = clients.get(client.id)
   
    if (agent) {
     
      // if client exists update its connected state to false in database
      try {
        await AgentService.createOrUpdate({ ...agent, connected: false })
      } catch (error) {
       return  handleError(error)
      }

      // Delete agent from clients connected list map js , porque se desconecto y esta false en db 
      clients.delete(client.id)

      // message broker => ...a los clientes mqtt  sub seran notificados 
      aedes.publish({
        topic: 'agent/disconnected',
        payload: JSON.stringify({
          agent: {
            uuid: agent.uuid
          }
        })
      })

      debug(
       `[report]: Client ${client.id} associated to Agent ${agent.uuid} marked as disconnected`
      )



    }



})

