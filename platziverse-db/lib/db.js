'use strict'

const Sequelize = require('sequelize') // es un constructor , es una class

/* un objeto singlton : es un objeto va tener solo una insatncia cada ves lo llamo a esta   funcion
   para configura db - por defecto null , lo inicialimos cuando ejecutemos la funcion de config de db */
let sequelize = null

/* otro pequeño modulo de js expone una funcion
 *
*/
module.exports = function setupDatabase (config) { // config Objeto de configuracion a recibir
  if (!sequelize) { // si es null
    sequelize = new Sequelize(config) // defincion del objeto sequilize : iniciandolo con objeto de config : informacion de db que desoe comunicar
  } // simplemente si existe instancia de conexion a db no la vas a crear de esta manera dejo de crear instancias a la db

  return sequelize
}
