const debug = require('debug')('platziverse:api:controller')

const { response , request } = require('express');
const { MyServices } = require('../db/db');






const Getmetrics = async(req, res = response, next) => {
 
 

  try { // traer tipos de metricas de un agente sin repeticion 

    const { Metric } = await MyServices();
    const { uuid } = req.params
    debug(`request to Metrics - Agent:${uuid}`);

    let metrics = [];

    metrics = await Metric.findByAgentUuid(uuid);

    if(!metrics || metrics.length === 0) {
        return next(new Error(` not found Metrics for Agent with uuid ${uuid}`))
    }

    
    res.json({
     metrics
   
    });
    
  } catch (error) {
   
    return next(error);
  }
 


}


const GetmetricsAgentType = async(req, res = response, next) => {  
 
  // ultimas 20 metricas reporetadas a db  de un agente en un especifico type .
  try {
    
    const { Metric } = await MyServices();
    const { uuid, type } = req.params;
    debug(`request to Metrics - Agent:${uuid} / metric type:${type}`);

    let metrics = [];

    metrics = await Metric.findByTypeAgentUuid(type, uuid);

    if(!metrics || metrics.length === 0) {
        return next(new Error(` not found Metrics for Agent with uuid ${uuid} with type:${type}`))
    }
  
   


     
    res.json({
      metrics     
     
    });


  } catch (error) {
    return next(error);
    
  }

  
    

   
   
}



module.exports = {
  Getmetrics,
  GetmetricsAgentType          
}