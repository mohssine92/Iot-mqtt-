const debug = require('debug')('platziverse:api:db')
const db = require('platziverse-db')




const services  = new Map();

const dbConnection = async ( ) => {

    const config = {

        database: process.env.DB_NAME || 'platziverse', // definir cual es el nombre de la db
        username: process.env.DB_USER || 'platzi',
        password: process.env.DB_PASS || '123456',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: s => debug(s), 
        //setup: true  recordemos esta prop borra la db : asi si la dejo en true  borra toda la db cada vez arrancamos el servidor mqtt
      
    }

   try {
    
    
      const { Agent , Metric } = await db(config);
     
      // almacennar en una mapa
      services.set('Agent', Agent );
      services.set('Metric', Metric );

      debug('connect to db - geted services ')



   }catch(err) {
       console.log(err);
       throw new Err('Error a la hora de iniciar la base de datos');
   }

 
}

const MyServices = async () => {
  
    // obtener de mapa - usar en controllers
  const Metric = services.get('Metric');
  const Agent  = services.get('Agent');
 
  return {
     Metric,
     Agent
  }

}










module.exports ={
    dbConnection,
    MyServices
}