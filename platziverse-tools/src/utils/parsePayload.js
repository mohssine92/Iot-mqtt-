'use strict'

function parsePayload(payload) {

  // TODO: estructuras validas a mandar atraves consola mqtt : 
  //mqtt pub -t 'agent/message' -m '{"agent": {"uuid": "yyy", "name": "platzi", "username": "platzi", "pid": 10, "hostname": "platzibogota"}, "metrics": [{"type": "memory", "value": "1001"}, {"type": "temp", "value": "33"}]}'
  // mqtt pub -t agent/message -h localhost -m '{"hello":"platziverse"}'

 

  if (payload instanceof Buffer) { // si es un buffer 
    payload = payload.toString()//
   // console.log('es buffer'); too json string
  }


  try {
    payload = JSON.parse(payload)
    // to object js
  } catch (error) {
    parsedPayload = null
  }

  return payload //
  
}

module.exports = parsePayload