'use strict'

const test = require('ava')
const proxyquire = require('proxyquire') 
const sinon = require('sinon')
const agentFixtures = require('./fixtures/agent')





const config = {
  logging: function () {}
}

const MetricStub = { 
  //aqui veremos como nos ayuda sinon libreria para hacer test : spy es una funcion me permite hacerle preguntas : si fue llamada o no , cuantas veces etc .. es muy util al hacer test 
  belongsTo: sinon.spy()
}
let AgentStub = null

let single = Object.assign({}, agentFixtures.single) // clonar Objeto single
let id = 1;
let uuid = 'yyy-yyy-yyy'
let sandbox = null 


let db = null
let uuidArgs = { 
  where: { uuid }
}

let connectedArgs = {
  where: { connected: true }
}

let usernameArgs = {
  where: { username: 'platzi', connected: true }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}



// hook - ejecuata antes de cada uno de los tests
test.beforeEach(async () => {
  // AgentStub esta en un scope que se ejecutara por cada test que disparamos , sinon solo nos puede engañar almoemnto de hacer preguntas cuantas veces fue llamada etc .. asi resolvemos con sanbox 
  // sanbox es un ambiente especifico de sinon que solo va a funcionar para un test en particular y al terminar dicho test reiniciamos sanbox al estado inicial estado 0 confin de no confundimos numero de llamadas 

  sandbox = sinon.createSandbox()

  // definicion
  AgentStub = {  
    hasMany: sandbox.spy()
  }

  // los objetos que redefinen los modelos en test - le anexamos metodos falso - y leresolvemos que lo que esperamos - para testear metodos reales de lso modelos .

  // Model create Stub 23
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  
  // Model update Stub 22 - 
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single)) 

  
  //TODO:  ahora puedo decir metodo findById existe my stub de mi modelo fixtisio  llamado en test  es decir , inicio stub , luego le defini so te llaman con ... que es lo que tiene que returnar 
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))


  // Model findOne Stub - 
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

   // proxyquire esta libreria permite requirir un modulo y sobre escribir los requires que esta hacien el modulo requerido 
   // facil cuando ejecuto test y hace requiremiento en vez de pasarme los objetos reales de modelos de sequilize me pasa estos metodos definidos AgentStub, MetricStub
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub, 
    './models/metric': () => MetricStub
  })
 
  // ejecuccion - aqui estara el test - 
  db = await setupDatabase(config)

})


// hook after cada test se dispara 
test.afterEach(() => {
  // si existe recrear sanbox ambiente 
  sandbox && sandbox.restore()
})




test('Agent', t => {
  // testar que db returna objeto Agent 
  t.truthy(db.Agent, 'Agent service should exist')
})

// ejecuta test en serie no en paralelo , por tema de modificacion de entorno de sinon 
test.serial('Setup', t => { 
  
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed') 
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')

})

test.serial('Agent#findById', async t => { // test de servicio Agent

  let agent = await db.Agent.findById(id) // esta es la forma de obtener un agente atraves de mi servicio : es decir voy a aprobar esta funcion de mi servicio si trae la data deseada o algo va mal 

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

   // testear servicio 
  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same') // agentFixtures.byId(id) : la data esperada del agent : tiene que ser igual
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')

})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args')

  t.is(agents.length, agentFixtures.platzi.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')

})


test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)
 
   t.true(AgentStub.findOne.called, 'findOne should be called on model')
   t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
   t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')
   t.true(AgentStub.update.called, 'agent.update called on model')
   t.true(AgentStub.update.calledOnce, 'agent.update should be called once')
   t.true(AgentStub.update.calledWith(single), 'agent.update should be called with specified args')

  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async t => {
 
  let agent = await db.Agent.createOrUpdate(newAgent) // en caso agente nuevo 

    t.true(AgentStub.findOne.called, 'findOne should be called on model')
    t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
    t.true(AgentStub.findOne.calledWith({
     where: { uuid: newAgent.uuid }
    }), 'findOne should be called with uuid args')
    t.true(AgentStub.create.called, 'create should be called on model')
    t.true(AgentStub.create.calledOnce, 'create should be called once')
    t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')

    t.deepEqual(agent, newAgent, 'agent should be the same')
})















