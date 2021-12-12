'use strict'

const EvenEmitter = require('events') // object del core de node donde extendemos funciones para crear nuestro objeto de tipo Eventemmiter
const os = require('os') // modulo de systema operativo de node 
const util = require('util') // objeto trae una funcion para convertir un callback a un promise
const debug = require('debug')('platziverse:agent')
const defaults = require('defaults')
const mqtt = require('mqtt') // cliente en este caso 
const uuid = require('uuid') // generacion de uuid unico : as tomo la desicion si retransmito payload o no , lo logico no transmito a mi mismo 
const {
  utils: { parsePayload }
} = require('platziverse-tools')


// implemenatacion de object tipo Event emmiter y integrarlo con cliente mqtt .

class PlatziverseAgent extends EvenEmitter {


    constructor(options) {
        // ejecuccion de contructor de la class superior
        super()
        // Default options used internally if not options were provided
        this._defaultOptions = {
          name: 'unknown',
          username: 'platzi',
          interval: 5000,
          mqtt: { host: 'mqtt://localhost' }
        }
        
        // toma por defecto , y redefine lo que llega en options arg 
        this._options = defaults(options, this._defaultOptions) 
        this._started = false
        this._timer = null // guardar ref de timer para poder destrocer 
        this._client = null // be cliente mqtt 
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

        // si el timer no ha arancado 
        if (!this._started) { 
          
          // cliente mqtt para publicar metricas al message broker y para recibir  mensages del message broker de otras instancias de agente . siempre cuando el agente este connectado 
          this._client = mqtt.connect(this._options.mqtt.host)
          this._started = true  // timer arrancado referencia para saber .. 
    
          // subscribir cliente mqtt que es prop de la clase , a estos topicos : asi cada instancia ... escucha broadcast del message broker a estos topics 
          this._client.subscribe('agent/connected')
          this._client.subscribe('agent/disconnected')
          this._client.subscribe('agent/message')
    
          this._client.on('connect', () => { // evento del cliente mqtt cuando see conecta 

            // When the client is connected assign an unique uuid to the agent
            this._agentId = uuid.v4()
    
            // emito evento internamente que debo escucharlo internamente dentro de la instancia (usamos class de tipo event emmiter )
            this.emit('connected', this._agentId)
    
          
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
    
               
                for (let [metric, func] of this._metrics) {
                  if (func.length === 1) { // verificar si una funcion tiene un arg pues es callback
                    func = util.promisify(func)
                  }
    
                  // The promise then is resolve to send the message
                  message.metrics.push({
                    type: metric,
                    value: await Promise.resolve(func()), // puesto que es una promesa la resuelvo obtengo la produccion de la misma
                    timestamp: new Date().getTime()
                  })
                }
    
                debug(`[agent-sending]: ${message}`)
    
                // este cliente mqtt de esta instancia PlatziverseAgent  emite este topic al messagebroker .
                this._client.publish('agent/message', JSON.stringify(message))
                // esta instancia PlatziverseAgent emite este evento internamente para escucha internamente 
                // para escuchar mi mensaje que emito al message broker
                this.emit('message', message) 
              }

              


            }, this._options.interval) // intervalo de tiempo de redisparo 
           
            

          })
    
          // evento de cliente mqtt cuando reciba mensaje del message broker al que esta connectado 
          // recuerda estas es una clasee de tipo event emmiter y implemnta internamente cliente mqtt , es decir vamos a tener n numero de instancia = n numero de clientes mqtt .
          this._client.on('message', (topic, payload) => {
            // If the topic is some of these parsed the payload and emit according the topic
            if (
              topic === 'agent/connected' ||
              topic === 'agent/disconnected'||
              topic === 'agent/message'  
            ) {
              const parsedPayload = parsePayload(payload)
              const { agent } = parsedPayload

              // la idea no escuchar al algun mensaje que fue emitido por la misma instancia al message broker que a su vez lo destrubuye a todas instancia de esta classe PlatziversAgent
              const shouldBroadcast =
                parsedPayload && agent && agent.uuid !== this._agentId  // true / false 

    
              if (shouldBroadcast) {
                this.emit(topic, parsedPayload) // emito internamente - porsupuesto si mio no llega a emitirlo si de otras instancias llega a emitir internamente y lo puedo ver 
                // asi tanto como otras instancia seran notificados de mis metricas yo tambien sera notificado de las metricas de otros , yo : es instancia Agent  
              }
            }
          })
          
          // la idea si pasa cualquier err . desconecta la instancia al servidor mqtt , 
          this._client.on('error', () => this.disconnect())
        }


    } // proceso cuando un agente esta conectado al message broker

    disconnect() {
        // desconecto solo si el timer inicializo , servicio fue inicializo 
        if (this._started) {
          clearInterval(this._timer) // limpiar timer no va emitir cada x tiempo (interval) : gracias a la ref this._started
          this._started = false // asi no puedo connectar de nuevo dentro la misma instancia despues de desconectar 
          this.emit('disconnected', this._agentId)  // internamente emito ....
          // desconnectar cliente mqtt al server mqtt : aqui veremos como controlamos la desconexion 
          this._client.end() 
        }
    }
    


}


module.exports = PlatziverseAgent;