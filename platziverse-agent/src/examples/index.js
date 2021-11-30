'use strict'

const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
  name: 'abdu',
  username: 'platzi',
  interval: 1000 ,
  
})

agent.addMetric('rss', function getRss() {
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise() {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback(callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})

// asi la mapa tendra tres funciones - asi un agente genera 3 metricas por 1s durante periodo de su conexion 

agent.connect()

// These are the methods expose by this agent instance
agent.on('connected', eventHandler)
agent.on('disconnected', eventHandler)
agent.on('message', eventHandler)

// This methods are for other agents
agent.on('agent/connected', eventHandler)
agent.on('agent/disconnected', eventHandler)
agent.on('agent/message', eventHandler)

// eventHandler function to be execute in each event
function eventHandler(payload) {
  console.log(payload)
}

function desconection () {
  setTimeout(() => agent.disconnect(), 5000)
}


// paraque no de desconecte nuestro agente y siguimos viendo las metricas en tiempo real 
//desconection()

//setTimeout(() => agent.disconnect(), 5000)