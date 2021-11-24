  
'use strict'

const db = require('../')

const chalk = require('chalk')





async function run () {

   
  /* recordemos que el modulo db platziverse-db requiere object de configuracion 
   * informacion de la base de datos ..
   * si queremos podemos pasarle mas opciones como :  logging: s => debug(s),  para ver todos lso scripts
   */
  const config = { 
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }


  /* Obtener los servicios que hemos implementado
   * podemos hacer control de errors implementando try - catch (Fernando Herrera ) - o de la menera implementada .catch()
   - desestructurando los Objetos servicios que returna la promesa  
   */
  const { Agent, Metric } = await db(config).catch(handleFatalError)  


  /* creamos un Agent en db real 
     al crear me entrega sql porque estamos usando loguuin por default que tiene sequelize (se ve ssql en consola) */
  const agent = await Agent.createOrUpdate({
    
    uuid: 'yyyx',
    name: 'testx',
    username: 'testa',
    hostname: 'testa',
    pid: 1, // id de proceso
    connected: true // digamos que esta conectado
  }).catch(handleFatalError)

  
  console.log(`${chalk.red('Agent')}`)
  console.log(agent)
  
  const agents = await Agent.findAll().catch(handleFatalError)
  console.log(`${chalk.red('Agents')}`)
  console.log(agents)
  
  // traer typos de  metricas de un agente agrupados
  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log(`${chalk.red('metrics')}`)
  console.log(metrics)
  
  // crear metrica asocida a un agente
  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)
  
  console.log(`${chalk.red('metric-created')}`)
  console.log(metric)
 
 
  // solicito metricas de un agent en un tipo en especifico 
  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
  console.log(`${chalk.red('metrics de Agent - en specific Type')}`)
  console.log(metricsByType)



}


function handleFatalError (err) {
  /* en caso falla la promesa de db  
   * controlar excepciones de promesas de sequelize
   */
  console.error(err.message)
  console.error(err.stack)
  process.exit(1) // matemos el script por si al go falla
}



run()

/* ejecuta : node examples/index.js : para ejecucion de este script - para aprobar metodos de servicio y asegurar del proceso de interectuar con db 
 * asi que cada vez implemento un modelo con su servicio lo compruebo con un script similar a este  - rivas la db siempre
 *
*/