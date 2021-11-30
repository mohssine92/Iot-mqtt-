'use strict'

 // para definir tipo de datos de nuestro modelo
const Sequelize = require('sequelize')

const setupDatabase = require('../lib/db') 


module.exports = function setupAgentModel (config) {
  
  // returna singlton de sequilize que comunica a db segun config object : podemos decir es instancia de db 
  const sequelize = setupDatabase(config)

  return sequelize.define('agent', { // En objeto sequilize nativo hay una funcion define para definir los modelos utulizando objeto sensillo de js 

    uuid: {
      type: Sequelize.STRING,
      allowNull: false // requerido - no va permitir ningun dato null en db
    },
    username: { // definir que dueño es de este agente : para definir permisos y autenticacion autorizacion ...
      type: Sequelize.STRING,
      allowNull: false
    },
    name: { // puede ser nombre de la app que estamos monitoreando
      type: Sequelize.STRING,
      allowNull: false
    },
    hostname: { // desde que computador se esta conectando el agente (para saber si tenemos una app que esta siendo moniteada por multiples servidores , a que servidor pertenece esta app)
      type: Sequelize.STRING,
      allowNull: false
    },
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // valor  por default a insertar en tabla
    },
    connected: { // en dashboard me interesa ver solo los agentes que estan conectados (bolean) para identificar los que estan conectados
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // valor  por default
    }

  })
} // asi cada vez llamamos a esta funcion nos returna el modelo
// de esta manera hemos definido la funcion : setupAgentModel de configuracion del modelo Agente
