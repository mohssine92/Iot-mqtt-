'use strict'





module.exports = function setupAgent (AgentModel) { 
   

  async function createOrUpdate (agent) {
  
      const cond = { // la condicion de la consulta 
        where: {
          uuid: agent.uuid
        }
      }
   
      // findOne returna la primera coincidencia 
      const existingAgent = await AgentModel.findOne(cond);

      if (existingAgent) {

        
        const updated = await AgentModel.update(agent, cond) 
        // updated : esto se actualizo returna numeros de filas es decir mas grande que 1 es verdadero
        return updated ? AgentModel.findOne(cond) : existingAgent 
                         // si lo actualizo return instancia de db , obtener info directamente de db y no un objeto de js 

      }

      // logica si el agente no existe crearlo : returna objeto de sequilize complejo lo convierto a json 
      const result = await AgentModel.create(agent)
      return result.toJSON()

  } // para test : no olvidar a implementar esta funcion en mi Stub



  function findById (id) { 
    return AgentModel.findById(id) 
  }


  function findByUuid ( uuid ) { 
    // findByUuid no existe como tal dentro del onbjeeto modelo sequilize
    return AgentModel.findOne({
      where:{
        uuid
      }

    })

  }

  function findAll () {
    return AgentModel.findAll()

  } 
  
  function findConnected () {
    return AgentModel.findAll({  // busqueda de la selccion que cumpla con la condicion
      where:{ 
        connected: true
      }
    })

  }

  function findByUsername (username) { // buscar todos agentes cuyo nombre de usuario ... y que este conectados
    return AgentModel.findAll({
      where: {
        username,
        connected: true
      }
    })

  }


  // funciones exportadas dentro del objeto de este servicio 
  return {
    findByUsername,
    findConnected,
    findAll,
    findByUuid,
    createOrUpdate,
    findById 
  }

} 
