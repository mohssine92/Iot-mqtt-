'use strict'




/* En esta funcion vamos a definir funciones de nuestro servicio 
 *  yo solo quiero exportar las funciones que yo quiera al usuario que esta utulizando me modulo
*/
module.exports = function setupAgent (AgentModel) { // recibe modelo de agente : donde definimos la entidad agente / en caso de test recibe Stub de sinon
   
  
  
  async function createOrUpdate (agent) {
  
      const cond = { // la condicion de la consulta 
        where: {
          uuid: agent.uuid
        }
      }
   
      const existingAgent = await AgentModel.findOne(cond);

      if (existingAgent) {

        const updated = await AgentModel.update(agent, cond) // args : info a actualizar , condicion de actualizacion
        // esto se actualizo returna numeros de filas es decir mas grande que 1 es verdadero
        return updated ? AgentModel.findOne(cond) : existingAgent // ternario si es verdadeo , .. : sino ..

      }

      
      /* aqui cuando crea en db me returna objeto complejos de sequelize , yo estoy convertiendo en json (como estoy comparando en mis pruebas) 
       *
       */
      const result = await AgentModel.create(agent)
      return result.toJSON()

  } // para test : no olvidar a implementar esta funcion en mi Stub



  function findById (id) { // podemos decir este es un servicio 
    return AgentModel.findById(id) // Modelo con Sequelize tiene un metodo llamada findById()
  }


  function findByUuid ( uuid ) { // findByUuid esta funcion no existe como tal dentro del objeto modelo de Sequilize - la Obtenemos de esta forma
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








  return {
    findByUsername,
    findConnected,
    findAll,
    findByUuid,
    createOrUpdate,
    findById // esta funcion la returnamos en un Objeto : es decir su producto sera returnado en este Objeto 
  }

} 
/* por conclusion este modulo exporta objeto de servicio de Agente que tiene funciones : podemos decir funciones de servicio Agent 
 * este servicio de Agente atraves de sus funciones comunica con modelo de entidad de agent : medelo sequelize : puesto que sequelize es un modelo para comunicar a un db dependiendo del objeto de config
*/ 