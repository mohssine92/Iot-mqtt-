'use strict'

// utils functions

const handleError = require('./utils/handleError')
const handleFatalError = require('./utils/handleFatalError')
const parsePayload = require('./utils/parsePayload')

const config = require('./config')



module.exports = {
  config,
  utils: {
    handleError,
    handleFatalError,
    parsePayload,
    
  }
}