  
'use strict'

const db = require('../')

const chalk = require('chalk')

const { utils } = require('platziverse-tools')
const { handleFatalError } = utils


async function run () {

   
 
  const config = { 
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    port : process.env.PORT || 5433,
    dialect: 'postgres'
  }



    const { Agent, Metric } = await db(config)
                                      .catch(handleFatalError)
  
  
    const agent = await Agent.createOrUpdate({
     uuid: 'yyy',
     name: 'test',
     username: 'test',
     hostname: 'test',
     pid: 1, // id de proceso
     connected: true // digamos que esta conectado
    }).catch(handleFatalError)

  
    console.log(`${chalk.red('--Agent--')}`)
    console.log(agent)
  
    const agents = await Agent.findAll().catch(handleFatalError)
    console.log(`${chalk.red('--Agents--')}`)
    console.log(agents)
  
     // traer typos de  metricas de un agente agrupados
     const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
     console.log(`${chalk.red('--metrics--')}`)
     console.log(metrics)
  
    // crear metrica asocida a un agente
     const metric = await Metric.create(agent.uuid, {
      type: 'memory',
      value: '300'
     }).catch(handleFatalError)
  
     console.log(`${chalk.red('--metric-created--')}`)
     console.log(metric)
 
 
     // solicito metricas de un agent en un tipo en especifico 
     const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
     console.log(`${chalk.red('--metrics de Agent - en specific Type--')}`)
     console.log(metricsByType)







}






run()

