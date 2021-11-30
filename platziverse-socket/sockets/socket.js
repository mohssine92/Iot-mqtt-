const Usuario  = require( '../classes/usuario');
const UsuariosLista  = require('../classes/usuarios-lista');
const chalk = require('chalk')


  // unica instancia que debo manejar de mis usuarios connectados - 
  //se reinstancia solo cuando calle el servidor de nodejs . NO cuando socketserver pierde conexion con el cliente

  usuariosConectados = new UsuariosLista();


  // grabar objeto cliente conectado en una coleccion 
  const conectarCliente  = ( cliente , io  ) =>  {

      const usuario = new Usuario( cliente.id );
      usuariosConectados.agregar( usuario );


  }

  // delete object cliente de la coleccion cuando el mismo se desconecta
  const desconectar = ( cliente ,io) => {

    // cuando cliente pierde conexion al servidor 
    cliente.on('disconnect', () => {

      console.log(chalk.bgRed('client disconnected'),chalk.underline(cliente.id))
      usuariosConectados.borrarUsuario( cliente.id );   

     // server emit event to client
      io.emit('usuarios-activos', usuariosConectados.getLista() );

    })
  }

  const mensaje = ( cliente , io ) => { // io es mi servidor 

    // received custom message from  instance cliente 

    cliente.on('mensaje', ( payload ) => {
  
      console.log('message received ' , payload )

      io.emit('mensaje-nuevo', payload) // servidor emit a todos clientes connectados 
    }) 
 
  }


   //opdate object cliente 
    const configurarUusuario = ( cliente , io ) =>  {

    cliente.on('configurar-usuario', ( payload , callback  ) => {
  
     /* manejar de algun manera los clientes conectados , lo manejamos dentro de una clase porque si cliente hace refresh esto genera nueva comunicacion mediante sockets 
      por secuencia genera nuevo id del socket .si tenemos 1000 usuarios alli seria conviniente grabarlos en db . el procidemiento seria el mismo - o identificarlos mediante jwt
      */


       usuariosConectados.actualizarNombre( cliente.id, payload.nombre );
       console.log(`client configured ${cliente.id} with name ${payload.nombre}`)

       //notificar front-end de la lista 
       io.emit('usuarios-activos',usuariosConectados.getLista() );

       callback({ // la recibe solo el cliente emtente del event - podemos usar if else , returnamos callback de err despues de validar algo en el scope 
         ok: true,
         mensaje: `Usuario ${ payload.nombre }, configurado`
      });


    });


   } 


   //Obtener Usuarios
  const obtenerUsuarios = ( cliente , io  ) => {

   cliente.on('obtener-usuarios', () => {

    // emito solo al cliente solicitante pueda ser que los demas clientes conectados ya tienen la lista y no les interesa .
  
     io.to( cliente.id ).emit('usuarios-activos', usuariosConectados.getLista()  );
   
   });

  }




module.exports = { 
  conectarCliente,
  desconectar,
  mensaje,
  configurarUusuario,
  obtenerUsuarios

}
 
