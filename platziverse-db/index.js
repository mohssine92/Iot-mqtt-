'use strict'

// funcion me exporra singlton de la db usando sequelize
const setupDatabase = require('./lib/db')

// mis modelos
// funciones configuracion modelos : los que van a encargar de crear tablas y hacer consultas y returnan objeto del modelo pose de funciones para un modelo de entidad 
const setupAgentModel = require('./models/agent') // en pruebas unitarias el requireproxy en vez de pasar estas funciones - me va a pasar una funcionque returna AgentStub
const setupMetricModel = require('./models/metric') // en pruebas unitarias el requireproxy en vez de pasar estas funciones - me va a pasar una funcionque returna MetrictStub

// Mis servicios
const setupAgent = require('./lib/agent') 
const setupMetric = require('./lib/metric')


// V:17 => expone una funcion la que si no recibe objeto config por setub , toma la definicion del objeto del 2 arg (tomar Object config Por defect )
const defaults = require('defaults')






/* Definimos la parte basica del modulo de DB (de esta mmanera tenemos definido nuestro modulo de db con js )
 * Vemos que este Modulo va exportar Una funcion
 * pues al ser funcion asyncrona cada vez lo ejecuto me va returnar una promesa
 * de esta forma dentro de esta funcion que es nuestro modulo vamos Implemnetando los procesos que necesita paraque nos expones los Modelos listos como necesitamos (segun necesidades)
*/
module.exports = async function (config) {


  /* que es lo que hace defaults ? - creara un objeto de config por defecto
   * toma todo lo que llega en el objeto de config atraves de la ejecuccion del proceso de setup y lo obtenemos (lo que pasara en jecucion real )
   * sino va a tomar el objeto definido como 2 arg (es el caso de ejecucion de esta funcion de config de db atraves de test (pruebas unitarias))
   * en pruebas unitarias no occupo ejecutar el setup
   * setup me manda objeto config trae credenciales y variables de entorno para coneect a un db
   * no quiero hacer conneccion real a db - voy a utulizar base de datos de prueba : Sequelite (db en memoria)
   * 
   *
  */
  config = defaults(config , {
    dialect: 'sqlite', // entoces instalo modulo como modul de desarollo , npm i sqlite3 --save-dev (se usa solo para pruebas db en memoria etc .. )
    pool: { // pool de conexiones : le digo maximo user conexiones es de 10
      max: 10,
      min: 0,
      idle: 10000
    },
    query: { // sqilite/ por defecto entrega objetos complejos : asi true => paraque en cada queri me entrega objetos de json sensilloss
      raw: true // en caso de join debemos declarlo en la consultra - porque no acepta esta configuracion global
    }

  })



  /* Obtener la Instancia de sequilize
   * una  llamade estoy creando singlton asi que la sigientes veces cuando llamo a las funciones para crear los modelos interamente van a llamar la configuracion de db y van a obtener ese Singlton
   (ese objeto de conexion a db usando sequilize libreria)
   *
   */
  const sequelize = setupDatabase(config)



  /* llamar a los modelos de sequilize (recien configurados : difinicion de las entidades ) 
   * asi nos returna el Objeto del modelo contiene los metodos que vamos a necesitar para el modelo .
   */
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  /* poner interectura estas  entidades entre si  - lo que llamamos relaciones de entidades
   * cuando hemos definido el modelo ,no hemos creado agent_id , con estos tipos de funciones al crear las tablas crea estas props ,llaves forreanes etc .. automaticamente
  */
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)




  /* es una promesa ,
   * es una funcion del Objeto singlton de sequlize lo que hace se connecta a db hace un query basico para hacer una  suma ... con fin de saber si hay a coneccion directa con la db
  */
  await sequelize.authenticate()


  // object config credenciales de la db , no viene true desde otro mudulo

  if (config.setup) {
    // SYNCRONIZAR DB : sea voy a crear db en nuestro servidor , force true : segnifica si existe la db(tablas) : borrela y crea una nueva
    await sequelize.sync({ force: true })
  }



  /* Nuestros servicios 
   * cada servicio prove unos metodos que hemos implementado : estos metodos sus productos sea resultado de los metodos del modelo sequilize que van a interectuar con db .
   */ 
  const Agent = setupAgent(AgentModel) //AgentModel o en caso de test su equivalente stub de agent (sinon)
  const Metric = setupMetric( MetricModel, AgentModel )


 
  return {
    Agent,
    Metric
  }

  
}
