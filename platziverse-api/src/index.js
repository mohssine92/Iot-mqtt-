
require('dotenv').config();


const Server = require('./server');



// Instacia de Servidor de Express
const server = new Server();
server.listen();





  



 
/* {
    "id": 1,
    "uuid": 'e5d88c22-b0ce-4c3b-a093-3818868e0cbc',
    "username": 'platzi',
    "connected": true,
    "iat": 1516239022
  
}
 */


 // hemos visto la autenticacion  , ahora veremos la autorizacion : prop permissions asi que tipo de permisos tiene el token para trabajar con nuestra app




// JWT 

//payload
/* { 
    "permissions": [
        "metrics:read"
    ],
    "username": "platzi",
    "admin": true,
    "iat": 1516239022
}
   */

 // codificar payload
 // Buffer.from('{"permissions":["metrics:read"],"username":"moss","admin":true,"iat":1516239022}','utf8').toString('base64')


  
  // ver payload de jwt en consola 
  //Buffer.from('eyJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwidXNlcm5hbWUiOiJtb3NzIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0=','base64').toString()



// aws big data , sql postgres payton -- limpieza de datos data science - 