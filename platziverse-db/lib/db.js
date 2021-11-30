'use strict'

// es constructor - class , libreria para comunicar con dbs relacionales .
const Sequelize = require('sequelize') 

let sequelize = null

 // es singlton : cada vez llamo a esta funcion solo returna la misma instancia desde cuando el servidor levantado por coamndo node ...
module.exports = function setupDatabase (config) { 
 
 
  if (!sequelize) { // primera vez !nul = true 
    console.log('-- sequuilize es nulo en esta ejecucion especifica--- ');
    sequelize = new Sequelize(config) 
  } 

  return sequelize

}
