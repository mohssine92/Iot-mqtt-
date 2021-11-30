'use strict'

const chalk = require('chalk')


function handleError(error) {
 
  console.error(`${chalk.red('[error]:')} ${error.message}`)
  // stack saber exactamente tipo de err ocurrio 
  console.error(error.stack) 
  
}

module.exports = handleError