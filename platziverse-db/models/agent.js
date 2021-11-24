'use strict' // definicion del modelo usando squilize (objeto nativo : crea instancia db )

const Sequelize = require('sequelize') // para definir tipo de datos de nuestro modelo
const setupDatabase = require('../lib/db') //  Modulo que haga instancia a db - requiere arg config (objeto) (variables de entorno , dialecto )

/* modelo agent asi automaticly creara tabla con nombre agents
 +
*/
module.exports = function setupAgentModel (config) { // recibo objeto de config por fin de obtener instancia a db atraves del modulo pequeño que acabo de crea
  // Obtener instancia de la db
  // si exita la conexion a db , la tabla y campos seran definidos ...
  const sequelize = setupDatabase(config)

  return sequelize.define('agent', { // En objeto sequilize nativo hay una funcion define para definir los modelos

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
      defaultValue: false // valor  por default
    },
    connected: { // en dashboard me interesa ver solo los agentes que estan conectados (bolean) para identificar los que estan conectados
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // valor  por default
    }

  })
} // asi cada vez llamamos a esta funcion nos returna el modelo
// de esta manera hemos definido la funcion de configuracion del modelo Agente
