'use strict'

const net = require('net')
const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')

const db = require('platziverse-db')

const {
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
   -- en este caso ardes es mi message boeker : es el intermediario
*/
const aedes = require('aedes')({

  persistence: redisPersistence({
    port: 6379, // port redis db 
    host: '127.0.0.1', 
    family: 4,
    maxSessionDelivery: 100
  })

})


  
// credenciales de db - trasladarlo al modulo de tools
const config = {

  database: process.env.DB_NAME || 'platziverse', // definir cual es el nombre de la db
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || '123456',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s), 
  //setup: true  recordemos esta prop borra la db : asi si la dejo en true  borra toda la db cada vez arrancamos el servidor mqtt

}



// The server is implemented with core module `net` that expose a createServer method
// The net module provides an asynchronous network API for creating stream-based
// TCP or IPC servers (net.createServer()) and clients (net.createConnection()).
// See https://nodejs.org/api/net.html#net_event_connection
const server = net.createServer(aedes.handle)


// to store the clients connected
const clients = new Map()
let AgentService
let MetricService




/* este Objeto es de tipo event emmiter 
 * asi cada vez trabajamos con event emiter debemos manejar los errores
*/
server.listen(1883, (error) => {
  if (!error) {
    console.log(`${chalk.redBright('[platziverse-mqtt]:')} server MQTT is running in port: 1883`)
   
  } else {
    handleFatalError(error) // manejo de errores
  }
})




/* necesitamos instanciar el modulo de db o Obtener los servicios : justo cuando el servidor mqtt se inicia
 * de estas manera : se levanta server mqtt - instanciamos modul db - obtenemos servicios 
 */
server.on('listening', async () => {
   
   try {
      // Initializes Agent and Metric services
      const {Agent , Metric } = await db(config)
      AgentService = Agent
      MetricService = Metric  
      
   } catch (error) {//si el servidor ne es capaz de connectar a db - nosotros no lo vamos a ejecutar 

     // handleError(error) optimizacion 
     console.log(handleFatalError)

   }

})


/* vamos a implementar un paquete mqtt (cliente mqtt) para aprobar nuestro server mqtt : nuestro message Broker  (si recibe las pub) 
   (tambien podemos sub en el mismo message broker a algun topic )
 * podemos decir la instancia aede es nuestro message broker : es el intermediaro con que va a comunicar clientes mqtt machine to machine 
 * no olvidar que hay message broker gratuitos y de pago .
 * 
*/

aedes.on('client', (client) => { // when client mqtt connected to server mqtt
 
  debug(`[client-connected]: ${client.id}`) // ese id autogenerado por mqtt (lo maneja mqtt internamente )
 
})


// message broker recibe mesaje de un cliente de mqtt conectado obviamente
// when any clien pub message on own server mqtt
aedes.on('publish', async (packet, client) => { 
   
  debug(`[received]: ${packet.topic}`) // packet.topic : topic de mensaje pub por un cliente mqtt 

  if( packet.topic === 'Hola'){
    
    // console.log('11111111111111111111111111111111111111111111111'); 
  }

  // if the topic is `agent/message` makes process to save the agent
  // in the database else just log the topic
  if (packet.topic === 'agent/message') { 

   
    debug(`[payload]: ${packet.payload}`) //que mensaje nos ha llegado por parte de cliente mqtt

    const payload = parsePayload(packet.payload)

     if (payload) {
   
       let agent
       
       try {
         agent = await AgentService.createOrUpdate({
           // copy the agent and set the property `connected: true`
           ...payload.agent, // desestructurar props del object agent 
           //admin, luego veremos como manejamos admin si atraves de APi
           connected: true // is connected
         })
         debug(`[saved-agent]: ${agent.id}`)
   
       } catch (error) {
   
         handleError(error)
   
       }
   
        // if doesn't exist store the agent
        if (!clients.get(client.id)) {
         clients.set(client.id, agent)
         // publish the connected agent
         aedes.publish({
           topic: 'agent/connected',
           payload: JSON.stringify({
             agent: {
               uuid: agent.uuid,
               name: agent.name,
               hostname: agent.hostname,
               pid: agent.pid,
               admin: agent.admin,
               connected: agent.connected
             }
           })
         })
       }
   
   
        // Here the logic to store metrics
         // With map we try to save the metrics parallelly.
         // `map` accepts a sync callback so it returns an array of promises
         // then wait until all the promises are solved and store them into
         // `resolvedPromises` array. At the end log all the ids of each metric
         // saved and it associate agent
         try {
           const promises = payload.metrics.map(async (metric) => {
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
   
           handleError(error)
   
         }
   
     }

  }else{ // si tenemos mas topics a manejar implemenatmos il else etc .. o un switch .

   debug(`[payload]: ${packet.payload}`)

  }  


}) 



aedes.on('clientDisconnect', async (client) => { // when a client mqtt disconnect

    debug(`[client-disconnected]: ${client.id}`)
    
    // Try to find the client in the clients connected list
    // veremos la utulidad de esta parte cuando tendremos un cliente que mantiene conexion : cuando implementamos modulo de agente .
    const agent = clients.get(client.id)
   

    // si existe es decir no es vacio trae agent es decir fue conectado y fue registrando las metricas por un cierto tiempo 
    if (agent) {
      // if client exists update its connected state to false in database
      try {
        await AgentService.createOrUpdate({ ...agent, connected: false })
      } catch (error) {
        handleError(error)
      }

      // Delete agent from clients connected list
      clients.delete(client.id)

      // message broker publica a los clientes que tal cliente fue desconectado 
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

