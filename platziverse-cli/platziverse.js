#! /usr/bin/env node
// para ejecutarlo como se fuera un binario : ./platziverse.js  60

'use strict'

// permite crear interfaz rica en el terminal 
const blessed = require('blessed')
// la que contiene componenets widgets - para crear lineas de visualizacion o graficas para nuestras metricas
const contrib = require('blessed-contrib')
const moment = require('moment')
const platziverseagent = require('platziverse-agent')

const agent = new platziverseagent()




// 62
const screen = blessed.screen()

// para tener refrencia interna de los agentes que se estan connectando y las metricas  con el fin para que mas adelante las puedo renderizar 
const agents = new Map()
const agentMetrics = new Map()
let extended = []
let selected = {
  uuid: null,
  type: null
}

// deficion como sera grid 
const grid = new contrib.grid({
    rows: 1,
    cols: 4,
    screen // instancia pantalla donde pintara este grid
})

// compnente tree : de tipo  arbol : donde vamos a tener lista de los agentes 
// setearlo al grid 
const tree = grid.set(0, 0, 1, 1, contrib.tree, { // fila 0 , col 0 , 1 : tomar todoo espacio de la col , 1 espacio de la fila  
    label: 'Connected Agents'
})

// componnete de linea
const line = grid.set(0, 1, 1, 3, contrib.line, { // usa 3 espacio de la col que tengo disponible 
    label: 'Metric', // titulo
    showLegend: true,
    minY: 0,
    xPadding: 5
})

//cuando se connecte agente 
agent.on('agent/connected', payload => {
    const { uuid } = payload.agent
  
    if (!agents.has(uuid)) {
        agents.set(uuid, payload.agent)
        agentMetrics.set(uuid, {}) // map js 
    }
    
    // encargada de pintar estos ...agente en el arbol 
    renderData()
})

agent.on('agent/disconnected', payload => {
    const { uuid } = payload.agent
  
    if (agents.has(uuid)) {
      agents.delete(uuid) // delete of map js
      agentMetrics.delete(uuid) // ...
    }
  
    renderData()
})

agent.on('agent/message', payload => {
    const { uuid } = payload.agent
    const { timestamp } = payload
  
    // que pasa si la app se esta ejecutando y llega otro agente ? pues lo vamos a a agregar 
    if (!agents.has(uuid)) {
      agents.set(uuid, payload.agent)
      agentMetrics.set(uuid, {})
    }
  
    const metrics = agentMetrics.get(uuid) // obtencion de map js {}
  
    payload.metrics.forEach( m => { // recuerda las metricas que emite agente es un arreglo de objects type
      const { type, value } = m
  
      if (!Array.isArray(metrics[type])) { // verificar si la metrica no existe dentro del objeto , por su llave que es type (si no exite como array)
          // metrics object from map js inicialmente sera vacio aqui donde voy agregando las metricas
        metrics[type] = [] // inicio array vacio para poder ingresar metricas ..
      }

      const length = metrics[type].length
      // borrala primera
      if (length >= 20) {
        metrics[type].shift() 
      }
      // empuja en el ultimo indice la metrica ..
      metrics[type].push({ 
        value,
        timestamp: moment(timestamp).format('HH:mm:ss')
      })
    })
  
    renderData() //  const metrics es glbal respecto a esa funcion , la puede verificar en su escope 
})

tree.on('select', node => {

  // clclick + = extended sera true , clcik - extended sera false  (abrir , cerrar )
  // caso derederizacion por defecto sera false pero a la que extendimos sear empujada en la coleccion y returna true segun condicion 
  // podemos decir hemos inventado una memoria para mantener el estado de extended segun nuestro control 
  
  const { uuid } = node  // uuid existe tanto en Agent como si children metrics

  if(node.agent){
     node.extended ? extended.push(uuid) : extended = extended.filter(e => e !== uuid)
     selected.uuid = null
     selected.type = null
     return
  }

  // si no es agente  node.Agent = false 
  selected.uuid = uuid
  selected.type = node.type

  renderMetric() // graficar metricas seleccionadas

 
})
  

function renderData () {

    const treeData = {}
    let idx = 0
  
    for (let [ uuid, val ] of agents) { // maps
      const title = ` ${val.name} -  (${val.pid})`
      // [llave]
      treeData[title] = {
        uuid,
        agent: true,
        extended: extended.includes(uuid), 
        children: {}
      }


      const metrics = agentMetrics.get(uuid) // {} no olvidar se manipula objetos en js por referencia 
      Object.keys(metrics).forEach(type => {  // Object.keys(metrics) retur coleccion de keys
         const metric = {
          uuid,
          type,
          metric: true
         }

        // const metricName = ` ${type}`
         const metricName = ` ${type} ${' '.repeat(1000)} ${idx++}`
         treeData[title].children[metricName] = metric
      })

    }

     // setaer al objeto arbol - 
    tree.setData({
      extended: true, // extendido que me muestre todo abierto 
      children: treeData // hijos va a ser este objeto que yo he creado 
    })
  
    renderMetric()
}

function renderMetric () {
  if (!selected.uuid && !selected.type) {
    // pintar grafica vacia , datos eje x , eje y como se llama esa metrica  title
    line.setData([{ x: [], y: [], title: '' }])
    // renderizar pantalla y salir 
    screen.render()
    return
  }

  const metrics = agentMetrics.get(selected.uuid)  // return  { types ... : [....] }
  const values = metrics[selected.type] // return  [....] 
  // grafica 
  const series = [{
    title: selected.type,
    // en este caso obtenemos los ultimos 10 datos de ese arreglo , para no pintar todos
  
    x: values.map(v => v.timestamp).slice(-10),
    y: values.map(v => v.value).slice(-10)
  }] 

  line.setData(series)
  // renderizar pantalla para redibujo
  // paar estar aqui un agnte tiene que ser conectado y disparando metricas asi el componente se renderize y va redibujando ....
  screen.render( ) 
}


// capturar en el objeto de screen teclas , C-c : control c 
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => {
    // si tecl0 uno  de estos teclas fializo el proceso
    process.exit(0)
})

// connectar aent despues de la construccion de grid 
agent.connect()
// decir al arbol recibir focus del teclado para poder interectuar 
tree.focus()
// renderizar todos mis componenetes  : pintar pantalla 
screen.render()
  
  