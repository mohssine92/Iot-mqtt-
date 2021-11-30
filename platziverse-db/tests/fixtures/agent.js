'use strict'

// definicion de un objeto de un agente
const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}


const agents = [
  agent, 
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test' }), // clonar Object y sobre escribir ciertos props 
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' })
]


function extend (obj, values) {
  const clone = Object.assign({}, obj) // este objeto vacio vamos a aplicarle todas props de este objeto que queremos clonar
  return Object.assign(clone, values)
}


module.exports = {
  single: agent, 
  all: agents, 
  connected: agents.filter(a => a.connected), 
  platzi: agents.filter(a => a.username === 'platzi'), 
  byUuid: id => agents.filter(a => a.uuid === id).shift(), // shift() paraque me returna solo uno sino filter() me returna un arreglo
  byId: id => agents.filter(a => a.id === id).shift()
}

