'use strict'

// configuracion db , instancia singlton de la mimsa
const setupDatabase = require('./lib/db')

// configuracion de modeos 
const setupAgentModel = require('./models/agent') 
const setupMetricModel = require('./models/metric') 

// Mis servicios
const setupAgent = require('./lib/agent') 
const setupMetric = require('./lib/metric')


const defaults = require('defaults')



module.exports = async function (config) {


  // modulo default si no paso script config db usa por defect 2 arg : script de db en memoria sqlite : uso en testing 
  // en caso de ejecuccion real voy a pasar script config con todas props definidas .
  config = defaults(config , {
    dialect: 'sqlite', // entoces instalo modulo como modul de desarollo , npm i sqlite3 --save-dev (se usa solo para pruebas db en memoria etc .. )
    pool: { // pool de conexiones : si tenemos varios usuarios accidiendo a la db 
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {  // porque squilize , me trae objetos complejos - esta prop hace que me lo tarega en json 
      raw: true // en caso de join debemos declarlo en la consulta - porque no acepta esta configuracion global
    }

  })


  // creacion de  singlton de config db 
  const sequelize = setupDatabase(config)

  // justo despues obtener Modelos - strucutras de tablas en db 
  // proceso de config de modelos va obtener instancia del singlton .
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // relacion de entidades - relacionar tablas .
  AgentModel.hasMany(MetricModel) // tiene mucho   AgentModel <=> Agentsetub en test unitario
  MetricModel.belongsTo(AgentModel) // pertenece a 

  // promesa para ver que la db esta bien configurada . hace query , hace suma para verificar que la conexion a db esta bien configurada 
  await sequelize.authenticate()


  if (config.setup) {
    // sequelize.sync : lo que hace toda la deficion de los modelos que haya en la app , si no existen a la db , tablas respectivas , este promesa los va a acrear automaticamente 
    // por eso su disparo lo ponemos en condicion , queda bajo nuestro control . eso hace borra db y crear nueva 
    await sequelize.sync({ force: true })
  }


  // Servicios con quien interectua servidores de comunicacion como : API , mqtt , o socket 
  // servicios son funciones exponen objeto con funciones custumizadas interectuan con modelos de db 
  const Agent = setupAgent(AgentModel) 
  const Metric = setupMetric( MetricModel, AgentModel )


 
  return {
    Agent,
    Metric
  } 

  
}


// arquitectura : entidad Agent aquella app que se va a conectar a servidor realtime mqtt y cada cierto tiempo va a reportar unas metricas que va a ser asociadas a ese agente
// Metrica tambien es una entidad 