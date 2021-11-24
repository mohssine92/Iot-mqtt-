const { response,  request } = require('express')



const permissions = ( ...permisos  ) => {
    // permite acceso solo a roles indicados 
    return (req , res = response, next ) => {
        

        // antes de permisos verificar token es requerido no olvidar pasar antes en capa de middleware
       // if ( !req.usuario ) {
       //     return res.status(500).json({
       //         msg: 'Se quiere verificar el role sin validar el token primero'
       //     });
       // }



        const { permissions } = req.user; 
      

        //let Permissions = [];

        if( permissions.length === 0 ){ 
            return res.status(401).json({
                msg: `El servicio requiere uno de estos permissos ${ permisos }`
            });
            
        } else {
          
           permissions.map( ( per ) => {  
                   
              if ( !permisos.includes( per ) ) {
                  return res.status(401).json({
                      msg: `El servicio requiere uno de estos permissos ${ permisos }`
                  });
              }
             
           })


        }
        

        
    
        
  

        next();

    }
}



module.exports = {
   permissions, 
}