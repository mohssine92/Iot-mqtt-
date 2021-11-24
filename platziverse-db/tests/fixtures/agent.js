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

/* digamos queremos tener un arreglo deagentes
 * paraque ? digamos cuando queremos listar todos agentes o todos agentes conectados etc ..
 *
*/
const agents = [
  agent, // index 0 : va ser el objeto agente que acabamos de crear
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test' }), // clonar Object y sobre escribir ciertos props 
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' })
]

/* esta funcion va extender un objeto y lo va a aplicar los siguiente valores
 * para sobre escribir un objeto , clonarlo y remplazarle  ciertos valores
*/
function extend (obj, values) {
  const clone = Object.assign({}, obj) // este objeto vacio vamos a aplicarle todas props de este objeto que queremos clonar
  return Object.assign(clone, values)
}

/* Pues voy a hacer usar estas funcionalidades para hacer pruebas de nuestros servicios
 * como si estoy haciendo un mock de mi objeto de mi base de datos
*/
module.exports = {
  single: agent, // 1 solo agente
  all: agents, // si quiero todo agentes
  connected: agents.filter(a => a.connected), // solo los connect true
  platzi: agents.filter(a => a.username === 'platzi'), // solo ... see the docs
  byUuid: id => agents.filter(a => a.uuid === id).shift(), // shift() paraque me returna solo uno sino filter() me returna un arreglo
  byId: id => agents.filter(a => a.id === id).shift()
}

/* en consola : 
 * const agentFixtur = require('./tests/fixtures/agent'); 
 * ahora bien puedo acceder a las props exportadas porel mudule fixture
 */