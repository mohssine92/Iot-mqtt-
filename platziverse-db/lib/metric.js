'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
 
 
  async function findByAgentUuid (uuid) { // vamos a buscar las metric apartid del Uuid del Agent
     
        return MetricModel.findAll({ // usar modelo de metric + join
           attributes: [ 'type' ], // puedo pasar arreglo con nombres del attributos especificos que quiero que returne , en este caso solo un attributo que es type
           group: [ 'type' ], // agrupar por tipo - no repite mismo tipo . copu , memoria <= ok , no =>  cpu cpu memori memori ,  
           include: [{ // join - puedo hacer con diff tablas - en este caso lo hago solo con una tabla
             attributes: [], // de Agent : defino los attribues que me returnar - en este caso ne va ser ninguno 
             model: AgentModel, // join lo hago  solo con este modleo . puedo hacerlo con varias .
             where: { // ese joi se va a filtrar por uuid 
               uuid
             }
           }],
           raw: true // como es consulta con subconsulta (consulta comleja) - le digo me returne solo json() - No objeto complejo
        }) // raw debe especificarlo cuando hago la consuta compleja siempre 
 
  }  


  async function findByTypeAgentUuid (type, uuid) {
    
    return MetricModel.findAll({
         
        attributes: [ 'id', 'type', 'value', 'createdAt' ], // los attr que me interesa returnar del modelo Metric
        where: { // filtrar por type en Metric
          type
        },
        limit: 20, // en la grafica quiero ver solo 20 metricas
        order: [[ 'createdAt', 'DESC' ]], // ordenar usando fecha campo , ultimo , penultimo .. 
        include: [{ // join : 
          attributes: [], 
          model: AgentModel,
          where: { // condicion defiltro en modleo Agent 
            uuid
          }
        }],
        raw: true // entrege solo json

    })

  } 


  async function create (uuid, metric) { // recibe uiid del agente , y la informacion de la metrica como tal que nosotros vamos a almacenar 

    const agent = await AgentModel.findOne({ // Buscar si el agente existe en al db 
      where: { uuid }
    })


    if (agent) { // si existe

      Object.assign( metric, { agentId: agent.id }) // es clonar Objeto metric y asignarle otra prop que es agentId Obviamente que el agente debe existir en nuestros DB 
      const result = await MetricModel.create(metric)
      return result.toJSON() 

    }
    // aqui no necesito actualizar  metrica , la logica de la app siempre voy a agregar una metrica nueva 
    

  }


  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }


} 