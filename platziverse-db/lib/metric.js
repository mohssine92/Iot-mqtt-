'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
 
 
  async function findByAgentUuid (uuid) { // vamos a buscar las metric apartid del Uuid del Agent
     
        return MetricModel.findAll({ // usar modelo de metric + join
           attributes: [ 'type' ], // puedo pasar arreglo con nombres del attributos especificos que quiero que returne , en este caso solo un attributo que es type
           group: [ 'type' ], // agrupar por tipo - no repite mismo tipo 
           include: [{ // join - puedo haver con diff tablas - en este caso lo hago solo con una tabla
             attributes: [], // de Agent : defino los attribues que me returnar - en este caso ne va ser ninguno 
             model: AgentModel,
             where: { // la condicion de busqueda de mi consulta
               uuid
             }
           }],
           raw: true // como es consulta con subconsulta (consulta comleja) - le digo me returne solo json() - No objeto complejo
        }) // only return Type , necesito ver Sgente que metricas esta reportando , un agente reporta de una a n metricas : reporta memoria , cpu , disco duro , esta consula me dica los tipos de metricas que este agente esta reportando
 
  }  


  async function findByTypeAgentUuid (type, uuid) {
    
    return MetricModel.findAll({
         
        attributes: [ 'id', 'type', 'value', 'createdAt' ], // de la tabla metrics
        where: { // filtrar por type
          type
        },
        limit: 20, // en la grafica quiero ver solo 20 metricas
        order: [[ 'createdAt', 'DESC' ]], // primero ultimo 
        include: [{ // join - 
          attributes: [],
          model: AgentModel,
          where: { // condicion por ...
            uuid
          }
        }],
        raw: true // entrege solo json

    })

  } // devolver toda metricas(limit) del agent con el tipo especificado 



  async function create (uuid, metric) { // recibe uiid del agente , y la informacion de la metrica como tal que nosotros vamos a almacenar 

    const agent = await AgentModel.findOne({ // Buscar si el agente existe en al db 
      where: { uuid }
    })


    if (agent) { // si existe

      Object.assign( metric, { agentId: agent.id }) // es clonar Objeto metric y asignarle otra prop que es agentId Obviamente que el agente debe existir en nuestros DB 
      const result = await MetricModel.create(metric)
      return result.toJSON() // depues de grabar usando Sequelize me returna Object comolejo de Sequelize Lo transformo en formato Json (que es el estandar) 

    }
    /* la metrica la almaceno con agenteId y me deberia hacer la relacion - que un agente tiene muchas metricas     
     * aqui no vamos a necesitar actualizar una metrica , en la logica de la app siempre voy a agregar una metrica nueva , yo nunca voy a actualizar las metricas , yo con el Agent si la voy a actualizar , porque 
     * tengo una variable para identificar si el agente esta connectado o no . 
     * yo creo el agente , marcarlo como conectado , y se el agente se desconecta voy actualzando el agente marcarlo como desconectado par poder manejar ese tipo de estado 
     * con la creacion de metrico yo no necesito hacer esto 
     */


  }


  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }


} /* para pruebas unitarias de este servcio de Metric en el video 24 , hay un repo de github en coments  
   * si llego a necesitar
   *
  */