'use strict'

const express = require('express')
const asyncify = require('express-asyncify') // dale suporte async await a los mdlrs y a las rutas de express 
const axios = require('axios')


const { endpoint, apiToken }  = require('./global/environment');

const api = asyncify(express.Router()) // wrap del enrutador para dar supporte ...


// ok
api.get('/agents', async (req, res, next) => {
  // este server API es intermediario comunica a cliente y hace llamadas http internamente a Apis tokonizadas mayor segurida con fin de no compartir api key con cliente 
  
  let result;
  const instance = axios.create({
    baseURL: `${endpoint}/api/agents`,
   // timeout: 1000,
    headers: {'apiToken': `${apiToken}`}
  });
  
  try {

    const  { data } = await instance.get();
    result = data
      
  } catch (e) {
      // no olvidar implementar mflr de manejar err en servidor
    return next(new Error(e.error.error))
  }

    res.json(result);
})

// ok
api.get('/agent/:uuid', async (req, res, next) => {
 
  const { uuid } = req.params

  let result

  const instance = axios.create({
    baseURL: `${endpoint}/api/agents/${uuid}`,
   // timeout: 1000,
    headers: {'apiToken': `${apiToken}`}
  });

  
  try {
    const  { data } = await instance.get();
    result = data
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.json(result)
})

api.get('/metrics/:uuid', async (req, res, next) => {
 
  const { uuid } = req.params
  
  let result

  const instance = axios.create({
    baseURL: `${endpoint}/api/metrics/${uuid}`,
   // timeout: 1000,
    headers: {'apiToken': `${apiToken}`}
  });

  
  try {
    const  { data } = await instance.get();
    result = data
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.json(result)
})


// ok 
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  
  const { uuid, type } = req.params

  let result;

  const instance = axios.create({
    baseURL: `${endpoint}/api/metrics/${uuid}/${type}`,
   // timeout: 1000,
    headers: {'apiToken': `${apiToken}`}
  });
 
  try {

    const  { data } = await instance.get();
    result = data
      
  } catch (e) {
      // no olvidar implementar mflr de manejar err en servidor
    return next(new Error(e.error.error))
  }

    res.json(result);
})

module.exports = api




// con fin de no compartir apiKey con el cliente - las peticiones  http a esta APi requiere api key para tarer la data 
// yo no quiero compartir API KEY con el cliente : asi estas peticiones a la api ..  lo vamos a hacer nosotros desde a lado del servidor 

// video 54 