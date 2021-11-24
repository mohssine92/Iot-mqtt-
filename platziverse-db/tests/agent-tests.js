'use strict'   /* unico foco de este archivo es aprovar el agente */

const test = require('ava')

/* me permite requirir y sobre escribir desde a fuera , mi objetivo es sustituir los modelos originales con modelos falsos posen de las misma funcionalidades 
  
 */
const proxyquire = require('proxyquire') 

/* uso sinon para garantizar que algun funcion fue llamada
 *
*/
const sinon = require('sinon')

/* datos falso para prueba de mi servicio 
 * este modul exporta metodos que van a returnar datos fixtisios que va necesitar me servicio agent
 * asi rstos metodos me van a returnar datos que yo voy a comparar es decir esperar de la implemenatcion de los metodos de mis servicios traen 
 * si traen data diferente segnifica la prueba fallo
*/
const agentFixtures = require('./fixtures/agent')



/* Definicion de variables Globales : accedidas por cualquier funcion implemenatmos en el test  
 *
*/


/* yo voy a aprobar con db en memori squelite 
 * paso un ojeto de ocnfig basico : veo las props no estan definidas , asi va a tomar Objeto por default al momento de ejcuccion de la funcion db(config) en la prueba
*/
const config = {

  logging: function () {} // funcion cualquiera / ainon.spay() : es ua funcion con ventajas - depues puedo aprobar si fue llamada , cuantas veces fue llamada , etc../)(es muy util al momento de hacer test ) 

}


/* Es un Objeto va representar al modelo  
 * unico metodo que tengo que crear como stub seria : belongsTo (si tengo algun ObjetoModelo implementa otra diferente metodoRelacion del modelo sequilize seria la definida aqui para testearla posteriormente )
*/
const MetricStub = { // equivale Objeto Model

  belongsTo: sinon.spy()
  /* function(){} : en vez de definir una funcion cualquiera , lo vamos a decir que esto es un spay (viene del paquete sinon)
      => spy va ser una funcion especifica que me permitir hacerle preguntas(despues) : cuantas veces fue llamada esta funcion , si se fue llamada , con que args
      fue llamada es muy util a la hora de hacer pruebas con mas detalles para asegurarme del comportamiento que esta occuriendo 
  */
}


let single = Object.assign({}, agentFixtures.single) // clonar Objeto single
let id = 1;
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let sandbox = null 

// defincion de la variable global que vamos a pasar a funcion de config db
let db = null
let uuidArgs = { // debe ser igual al objeto real de condicion
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






/* ava tiene hooks : para correr funciones antes de cada uno de los tests
 * este hook ejecuta esta funcion asyncrona : Objetivo testear la funcion de configuracion de db basica por ello:
 * debo ejecutarla y pasarla lo que necesita como datos falso etc . el objetivo es testear el comportamiento del proceso que va a hacer y asegurar si es el esperado o hay que modificar algo 
 * como si las funcion se han ejecutado , cuantas veces se han ejecutado , lo que returna .etc ..
 * */
test.beforeEach(async () => {
  /* crear un sambox : un ambiente para un test 
   * como estoy creando un stub de agente cada vez ejecuto un test , vamos a crear un sanbox con sinon (seria un ambiente especifico para esta prueba es decir cuando termino esta pruebo lo reseto) con fin de cunatas veces fue llamada una funcion 
     en un test - evitar acumulaciones de llamdas por ejecucion de test consecutivos (siempre resteo mi sandbox antes de ...)
   */
  sandbox = sinon.createSandbox()


  AgentStub = { // Sustituye ObjetoModelo agente en el test (debe defiinirle las mismas funciones del modelo original : porque lo vamos a llamar, testear despues ) 


    hasMany: sandbox.spy()
    /* porque sanbox.spy  ? : y no funcion normal 
     * en este caso estamos creando stub de agente cada vez que corrimos un test , nosotros vamos a hacer algo con sinon es crear un sambox : un sambox seria un ambiente especifico
     * de sinon que va a funcionar solo por 1 test , cuando ejecutamos test de nuevo arrancamos de nuevo : esto con fin de saber cuantas veces excatamete fue llamada esa funcion
     * (hasMany)en el proceso real , es decir si ejecuto nuevo test me restea el ambiente sambox.spay - no me acumula los del tests anteriores y sera un numero que no es real
     * mi interes saber cuantas veces se ejecuta una funcion en proceso real
    */

  }



  // Model create Stub 23
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

 
  // Model update Stub 22
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single)) 

  
  /* Model findById Stub : A nuestro stub del modelo le añadimos esta funcionalidad findByid
   * cuando ejecuto la prueba la va a necesitar en lib/agent 
   * programo stub de finfByd cuando sera llamada con arg que es lo que tiene que returnar (de esta forma me aseguro de la funcionalidad correcta de la misma)
  */
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))


  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))







  /* usar proxyquire para injectarle estos dos stups a nuestro modelo  
   * es decir cuando requiera el objeto (primer arg) index  , yo voy a sobreescribir los siguietes desde afuera (sobre escribir con modelos falsos posen de la misma funcionalidad y voy a testear)
  */
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })


  db = await setupDatabase(config)


})





// otro hook . sambox tengo que recrearlo cada vez ejecuto un test (ejecuta despues de cada test )
// asi en cada test tendre un sambox : un ambiente para un proceso en especifica (comportamiento real de Ejecuccion )
test.afterEach(() => {
  // si existe sambox , recrearlo : en esta manera volvemos al estado inicial (restear el sandbox que he usado para mi test )
  sandbox && sandbox.restore()
})





/* aprobar efectivamente ese objeto de db tiene el servicio de agente como objeto
 * si por ejemplo comento Agent en la funcion db (segnifica no existe ) asi falla la prueba (porque en la prueba yo estoy esperando que exista)
 * asi la prueba paso digamos el modulo de db me esta returnando un objeto Agent
 * este objeto no hace nada - pero simplemente necesito que  me Api me tiene que devolver un objeto
 * yo he programado el funcion basica de configuracion de la db , me tiene que returnar ese objeto asi lo apruebo (esto es el objetivo de las pruebas unitarias )
 * aprobanto las funcionalidades fundamentales que voy integrando en mi estructura inmensa de codigo . 
*/
test('Agent', t => {
  //  truthy => aprueba si existe esta prop en lo que resuelva el Objeto db (producto de la funcion db )
  t.truthy(db.Agent, 'Agent service should exist')
})


// ? como garantizar que estas funciones fueron llamadas v19
// este test serial es recomendado cuando estamos usando stups : (testeando varios stups en paralelo)
test.serial('Setup', t => { // Setup => presenta solamente nombre del test
  // spy me trae estons informacio si setubs furon llamados y etc ..... gracias a sinon module
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed') 
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')

})


test.serial('Agent#findById', async t => {

  let agent = await db.Agent.findById(id) // esta es la forma de obtener un agente atraves de mi servicio : es decir voy a aprobar esta funcion de mi servicio si trae la data deseada o algo va mal 

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

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


/* en este caso hacemos el test suponemos que el usurio exista es decir  
 * debe verificar la implemntacion ver qeu funciones se ejecutan y cantas veces .... 
 * 
*/
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















/* NB : efectivamenete he aprobado lo que he implementado que relmente el proceso se ejecuto como quiero
 * asi si implemento mas modelos con mas relaciones puede sustituir funcione relaciones y asegurarme de la ejecuccion de las mismas
 * y con que modelos se ejecutan  las mismas relaciones , otra cosa no creo que tengo aprobar en futuro
 * la prueba de db esta bien y es valida para cualquier proyecto .
 * asi la prueba del objeto modelo esta Agent esta bien
 */ // ya con esto vamos a poder a empezar a deseñar las funciones de la api de nuestro servico de Agent paraque llame especificamente al modelo
// asi vamos a aprender hacer consultas y almazenar en db utulizando sequelize mientras implmentas el servicio de agente
