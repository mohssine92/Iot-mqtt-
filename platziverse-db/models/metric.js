'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupMetricModel (config) {
 
  const sequelize = setupDatabase(config)

  return sequelize.define('metric', {

    type: { // puede ser una memoria - sensor de temperatura (una description de que tipo de metrica estamos monitoreando)
      type: Sequelize.STRING,
      allowNull: false
    },
    value: { // cual es el valor especificamente en ese momento que estamos monitoreando
      type: Sequelize.TEXT, // como texto : porque si queremos pasar estructuras complejas como json - tipo texto no tenga limite
      allowNull: false // no permitir almacenar datos vacios
    }

  })
} // funcion de configuracion del modelo metric
