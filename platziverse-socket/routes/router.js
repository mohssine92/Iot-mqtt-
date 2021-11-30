
// este es erachivo donde vamos a crear nuestros APIRESTFul
const { Router } = require ('express');
const  GraficaData = require( '../classes/grafica');
const { socket } = require('../sockets/socket');



const router = Router(); 

// es una clase usada como db de memoria - refresh de servidor class se purga la clase . 
// realidad deberia usar db real recuperar data aunque refresh 
const grafica = new GraficaData();



module.exports =  function (io) {

  
    // ars : path , handler en pocas palabras la funcion que va manejar esta peticion 
    router.get('/mensajes', ( req, res  ) => {

      res.json({
         ok: true,
         mensaje: 'Todo esta bien!!'
      });

    });

    router.post('/mensajes', ( req, res) => {
   
       const {cuerpo, de }  = req.body;

       const payload = { cuerpo, de };

       io.emit('mensaje-nuevo', payload ); 
   
        res.json({
          ok: true,
          cuerpo,
          de
        }); 

    }); 

   // :id deberia ser id del usaurio a quien quiero mandar mensaje
   router.post('/mensajes/:id', ( req, res) => {

      const { cuerpo, de  } = req.body;
      const { id } = req.params;

      
      const payload = {
         de,
         cuerpo
      }

     // como es singlton tenemos la msima instancia que esta corriendo en servidor de node .
     const server = Server.instance; 

      // referir a nuestro servidor de socket 
      // in emite a un usuario encuentre en un canal en particular : sala . cada user conectar al serversocket su id es su sala tambien 
      server.io.in( id ).emit('mensaje-privado', payload);


     // Rnviar a todo el mundo 
     //server.io.emit('mensaje-privado', payload);
   
   
  

       res.json({
          ok: true,
          cuerpo,
          de,
          id
       });

   });

   // Servicio para obtener todos los IDs de los usuarios
   router.get('/usuarios', async ( req, res) => {


    const idsSockets = awaitio.allSockets(); // ver video 51 comentarios - captura pantaalla otro ordenador - 


    try {

        res.json({
            ok: true,
            clients: Array.from(idsSockets)
            // ids sockets : clients connected . pude ser un user hace varias instancias asi varios ids socket
        });
        
    } catch (error) {

        return res.json({
            ok: false,
            error
        })

    }

    // TODO:  estos son ids de socktes de clientes conectados al servidor en el momento de la peticioon , refresh a nav puede actualizar id del cliente , nos sirve este id a emitir a los clientes 
    // un payload en tiempo real .
    // esto solo indica los ids conectados pero nasabemos de quien son , para saber aqui interviene db , update idsocket - si el cliente se desconecta al socket pierde la notificacion no la va a recibir 
    // se trata de realtime - 

   });

   // Obtener usuarios y sus nombres
    router.get('/usuarios/detalle', (  req, res) => {


      res.json({
         ok: true,
         clientes: usuariosConectados.getLista()
      });
      // TODO: aqui obtenemos detalles sobre clientes connectados , usamos nuestra clase como memoria - en preyecto real debe ser modelo para comunicar con mysql o mongodb , postgreal .
      // alli vamos crendo mas referencias segun  necesidades mas relaciones props etc etc ..  
    });

    // Grafica-two 

    router.get('/grafica', ( req, res  ) => {

       res.json( grafica.getDataGrafica() );

    });

    router.post('/grafica', ( req, res ) => {
      
       const mes      = req.body.mes;
       const unidades = req.body.unidades;
  
       grafica.incrementarValor( mes, unidades );

       io.emit('cambio-grafica', grafica.getDataGrafica() );


       res.json( grafica.getDataGrafica() );

    });



    return router;

}



