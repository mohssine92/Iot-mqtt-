'use strict' // este es un script va ser ejecutado por un comando de manere directa : Objetivo Inicializacion de la base de datos

/*  este modul me permite : tener mensajes de logs siempre cuando tengo una variable de entorno configurada
   ('platziverse:db:setup') => name espase : en que modulo , en que archivo estoy haciendo el debug
*/
const debug = require('debug')('platziverse:db:setup')


const { handleFatalError } = require('platziverse-tools')


/* este modulo la hemos visto con fernando herrera : este modulo me permite hacer preguntas en la consola y dependiendo de la respuesta puodre tomar decisiones
 * como lo que hemos hecho en la app de geolocalizacion de fernando herrera
 * en este caso lo usamos cuando ejecutamos script de droop and creat db , asegurarnos antes de ejecutar tomar la decision (opcion si sigo con la funcion o corto el proceso)
*/
const inquirer = require('inquirer')


/*  modulo : estetica : me permite estilizar colear strings etc ... 
 */
const chalk = require('chalk')


/* la funcion de db que hemos creado - index */
const db = require('./')


/* este objeto de prompt es el que me va permitir hacer preguntas : estas preguntas son promesas : asi cuando el user responde , estas promise estan resueltas ,
   yo obtengo el valor - asi la implemento en el async : asi beneficio del asyn await (mas info sobre modulo ver curso fernando herrera ) */
const prompt = inquirer.createPromptModule()


/* este script ejecuta esta funcion :
 * esta funcion tiene implementacion necesaria para la Inicializacion de la db en local o en remoto
   es decir aqui donde creamos Objetos de configuracion donde definimos variables de entorno de Ejecucion luego mism Objeto lo pasamos a la llamada de la funcion de configuracion de db
*/
async function setup () { // funcion asyncrona va ejecutar varios procesos : se jecuta al ejecutar este script
  /* y la coleccion paso objeto de pregunta o objetos de pregunrtas a resolver
   * const answer : donde obtengo la resolucion .... , asi depende se toma decision programada
  */
 


  if (process.argv.pop() == '--y') {
    /* node setup.js --y : es lo que va aejecuta heroku o etc ... 
     * asi evitamos propmt que est hecha para ejecuccion manual 
     */ 
    console.log('proceso automatico');
  
  }else{

    const answer = await prompt([
      {
       type: 'confirm', // tipo de pregunta sera de confirmacion : en este caso : si o no (inquirer tiene diferentes tipos de inputs)
       name: 'setup', // la respuesta la va a guardar en una prop setup
       message: 'This will destroy your database, are you sure?'

      } // en este caso paso solo 1 objeto de una pregunta
    
    ])

    if (!answer.setup) { // res : no , return _ corto el proceso : nuetra base de datos seguira sin drop and create
      return console.log('Nothing happened (Mohssine :D))') 
    } // si es true porque user digo si (pues no entro aqui ), pues continuo con el ejecuccion de procesos de esta funcion asyncrona - que acontinuacion drop and delete

  }
  


  /* definicion de objeto de configuracion que necesita instancia de sequilize para poder trabajar
   * para poder connectar a la db y hacer relaciones , crear tablas , (objetivo final lograr interectuar con la db )
   * primero pso valores como si fueran variables de entorno (voy a configurar despues) y por defecto paso estos valores que estoy usando en desarollo
   * recuerden que sequilize Object puede conectarse a diferentes tipos de db => mysql , SQLServer , Oracle , asique el codigo de sequelize va permanecer igual
   * asique si mañana quiero migrar a Mysql modifico el dialecto y Sequelize sepa como comunicarse .
  */
  const config = {

    database: process.env.DB_NAME || 'platziverse', // definir cual es el nombre de la db
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s), // espicie de debug : para ver en consola que mensajes esta devolviendo la db (npm i debug --save )  / me permite tener mensajes de logs siempre cuando tengo una variable de entorno configurada
    setup: true // sincroniza la db 

  }


  /* llamada a la funcion basica que hace procesos de configuracion de la db y las relaciones de las entidades (usando Objeto nativo de sequelize)
   *  const modelos = await db(config) console.log(modelos);
   */
  //await db(config)
  //  .catch(handleFatalError)
  //
  //console.log(`${chalk.red('Succes!')}`)
  //process.exit(0)

  try{

    await db(config)
    console.log(`${chalk.red('Succes!')}`)
    process.exit(0) 

  } catch (err){

    handleFatalError(err)
     
  }



}



/*  control de errors que pueden pasar en el proceso asyncrono de la db(config) funcion
 */
//function handleFatalError (err) {
//  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
//  console.error(err.stack)
//  process.exit(1) // matar el proceso
//}



setup()
