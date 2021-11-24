'use strict'

const EvenEmitter = require('events') // object del core de node donde extendemos funciones para crar muestro objeto de tipo Eventemmiter
const os = require('os')
const util = require('util') // objeto trae una funcion para convertir un callback a un promise
const debug = require('debug')('platziverse:agent')
const defaults = require('defaults')
const mqtt = require('mqtt') // objeto para creaciob de cliente mqtt que va usar una instancia deun agente para comunicar a un server mqtt : message broker
const uuid = require('uuid') // generacion de uuid
const {
  utils: { parsePayload }
} = require('platziverse-tools')




class PlatziverseAgent extends EvenEmitter {



    constructor(options) {
        // ejecuccion de contructor de la class superior
        super()
        // Default options used internally if not options were provided
        this._defaultOptions = {
          name: 'unknown',
          username: 'root',
          interval: 5000,
          mqtt: { host: 'mqtt://localhost' }
        }
    
        this._options = defaults(options, this._defaultOptions) // toma por defecto - si llega props en object lo sobreescribe
        this._started = false
        this._timer = null
        this._client = null
        this._agentId = null
        this._metrics = new Map()
    }

    
    
    addMetric(type, func) {
      this._metrics.set(type, func)
    }

    deleteMetric(type) {
     this._metrics.delete(type)
    }

    connect() {

        if (!this._started) { // !false = true - 
          // Connect the mqtt server and then set the agent started status to true
          this._client = mqtt.connect(this._options.mqtt.host)
          this._started = true  // asi no puede entrar ya que la instacia de agente a esta altura ya va empezar a emiitir - y se puede desconectar 
    
          // Agent will be subscribed to these topics 
          // estos topis pueden ser publisg por server mqtt o instace agente
          // en  this._client.on('message', esta pendiente de topics por parte de agent instance
          this._client.subscribe('agent/connected')
          this._client.subscribe('agent/disconnected')
          this._client.subscribe('agent/message')
    
          this._client.on('connect', () => {
            // When the client is connected assign an unique uuid to the agent
            this._agentId = uuid.v4()
    
            // Agent emit the event connected with the uuid created - lo emite enteramente en el contenedor del objeto  instanciado 
            this.emit('connected', this._agentId)
    
            // Emit the message each interval time defined
            this._timer = setInterval(async () => {
             
                // If there are one or more metrics we build the message to send
              if (this._metrics.size > 0) {
                const message = {
                  agent: {
                    uuid: this._agentId,
                    username: this._options.username,
                    name: this._options.name,
                    hostname: os.hostname() || this._options.hostname,
                    pid: process.pid
                  },
                  metrics: [],
                  timestamp: new Date().getTime()
                }
    
                // If the handleEvent function provided has a callback
                // the callback is converted into a promise with `util.promisify`
                for (let [metric, func] of this._metrics) {
                  if (func.length === 1) { // verificar si una funcion tiene un arg pues es callback
                    func = util.promisify(func)
                  }
    
                  // The promise then is resolve to send the message
                  message.metrics.push({
                    type: metric,
                    value: await Promise.resolve(func()) // puesto que es una promesa la resuelvo obtengo la produccion de la misma
                  })
                }
    
                debug(`[agent-sending]: ${message}`)
    
                // Use the client instance to publish the message with topic 
                this._client.publish('agent/message', JSON.stringify(message))
                this.emit('message', message) // emite mesaje internamente en el contenedor 
              }
            }, this._options.interval)

          })
    
          // lesenings topics betwen agents and server mqtt
          this._client.on('message', (topic, payload) => {
            // If the topic is some of these parsed the payload and emit according the topic
            if (
              topic === 'agent/connected' ||
              topic === 'agent/disconnected'||
              topic === 'agent/message'  
            ) {
              const parsedPayload = parsePayload(payload)
              const { agent } = parsedPayload

              // return true si cumple la condicion - siemplemente emitir internemente un mesage que viene desde el message broker que puede ser ha sido 
              // emitido de la misma instancia agente hacia el message broker y ha sido devuelto 
              const shouldBroadcast =
                parsedPayload && agent && agent.uuid !== this._agentId

    
              if (shouldBroadcast) {
                this.emit(topic, parsedPayload) // asi coge topic y lo emita interbamente para poder escucxharlo en la instancia
              }
            }
          })
    
          this._client.on('error', () => this.disconnect())
        }


    } // proceso cuando un agente esta conectado al message broker

    disconnect() {
        // Handle the disconnection event
        if (this._started) {
          clearInterval(this._timer)
          this._started = false // asi no pued edesconectar un agente ya desconectado y puede conectar el mismo 
          this.emit('disconnected', this._agentId) // internamente emito ....
          this._client.end() // cortar conexion con el servidor mqtt
        }
    }
    


}


module.exports = PlatziverseAgent;