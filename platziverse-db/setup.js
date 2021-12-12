'use strict' 

// eset archivo sera ejecutado atraves delinea de comandos , esta configurado en scripts de nuestro packages.json 
// ejecuatar secript pasando variable de entorno manualmente DB_NAME='foo' npm run setup


const debug = require('debug')('platziverse:db:setup')
const { utils } = require('platziverse-tools')
const { handleFatalError } = utils
const inquirer = require('inquirer') // decisiones atraves de consola
const chalk = require('chalk') // colore en consola estizar strings 
const db = require('./')
// ayuda a  recibir args flags por script de ejcuccion 
const minimist = require('minimist') 



const prompt = inquirer.createPromptModule()


async function setup () {
  
  const args = minimist(process.argv.slice(2))
 // console.log(args.yes);

  
  // al ejecutar script de db pasarle un flag --y , asi haga la configuracion sin pregunta humana prompt 
  //  node setup.js --yes proceso automatizado , caso de deploy 
  if (args.yes) {
    
    console.log('proceso automatico');
  
  }else{

    const answer = await prompt([
      {
       type: 'confirm', // si , no , pregunta de confirmacion 
       name: 'setup', // la respuesta la va a guardar en una prop setup
       message: 'This will destroy your database, are you sure?'

      } // prompt permite hacer preguntas en consola , es promesa , cuando user responde obtengo valor .
    
    ])

    if (!answer.setup) { // res : no , return _ corto el proceso : nuetra base de datos seguira sin drop and create
      return console.log('Nothing happened (Mohssine :D))') 
    } // si es true porque user digo si (pues no entro aqui ), pues continuo con el ejecuccion de procesos de esta funcion asyncrona - que acontinuacion drop and delete

  }

  // TODO: cunado instalamos esto en degital ocean , la db la llamamos platziverseproduccion etc . asi primero pasamos valores como se fueran valores de entorno 
  // || o poe defecto en cao d desarollo 
  const config = {
    database: process.env.DB_NAME || 'platziverse', 
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    port : process.env.PORT || 5433,
    dialect: 'postgres', // recuerde que sequilize puede conectar a difentes tipos db : mysql, postgres , sqlserver , oracle , dependientemente de db mismo codigo se squelize va permanecer igual . 
    logging: s => debug(s), // espicie de debug : para ver en consola que mensajes esta devolviendo la db (npm i debug --save )  / me permite tener mensajes de logs siempre cuando tengo una variable de entorno configurada
    setup: true // usado como condicion para sincronizar la db .
  }

  try{
    
    // lo que hace proceso de esta promesa : creacion db relacion entidad export services .
    await db(config)
    console.log(`${chalk.red('Succes!')}`)
    process.exit(0) 

  } catch (err){

    handleFatalError(err)
     
  }


}



setup()
