const debug = require('debug')('platziverse:api:controller')

const { response , request } = require('express');
const { MyServices } = require('../db/db');





// obtener todo los agentes
const GetAgents = async(req, res = response, next ) =>{

    const { user } = req;   
    const { uuid } = user;

    try {


      const { Agent } = await MyServices();
   
      if ( !user || !user.username ) {
        return next(new Error(`not authorized`)) // instancia de object err
        // en la clase de mi servidor , he implementado un mdlr after build response , next dispara err al accumulador
      }


      // validar si es admin : aldminisrador ver todos agent - si no es ve solo el suyo
      const agent = await Agent.findByUuid( uuid );
      const { admin } = agent;
     
     
      let agents = []; 
      if( admin ){

        debug(`request give all agent because is admin`);
       
        agents = await Agent.findConnected();

      }else{

        debug(`request give all agent of only this username`);
        console.log(user.username) 
        agents = await Agent.findByUsername( user.username );

    
      }

     
      
    
      res.json({
        agents
    
      });
      
    } catch (error) {
      return next(error);
    }

}


// specific agent
const GetAgent = async(req, res = response , next ) =>{
 


   try {
     
     const { Agent } = await MyServices();
     const { uuid } = req.params;
    

     debug(`request to Agent ${uuid}`);
   
     let agent;
     agent = await Agent.findByUuid(uuid)
  
     if (!agent ) {

      return next(new Error(`Agent not found with uuid ${uuid}`)) // instancia de object err
      // en la clase de mi servidor , he implementado un mdlr after build response , next dispara err al accumulador

     }

     res.json({
      agent
     });
    
     
   } catch (error) {

     return next(error);

   }



  

   

 
   
}




module.exports = {
 GetAgents, 
 GetAgent
        
}