const { Usuario } = require( './usuario');
 


// toda la comunicacion de sockets esta basada en esta clase de un usuario fisico conectado 
// sustituible por db , o servicios db platzi .
class UsuariosLista {


   constructor() { 
       this.lista = [];
   }

    // Agregar un usuario
   agregar( usuario  ) {

        this.lista.push( usuario );
        console.log( this.lista );
        return usuario
   }

    actualizarNombre( id , nombre  ) {
        // TODO: en este caso asi se actualiza la memeria , si hubiera db se hace query al modelo  y se actauliza y todo correcto . 
        // o si trabajamos con micro servicos  requerimos modulo db y usamos servicios recien configurados o usamos modulo http para comunicar via http a otro api para hacer almacenamiento  :D ,
    
       
        for( let usuario of this.lista ) {

            if ( usuario.id === id ) {
                usuario.nombre = nombre;
                break;
            }

        }


        console.log('===== Actualizando usuario por id ====');
        console.log( this.lista );

    }

    // Obtener lista de usuarios connectados
    getLista() {
      // pequeña validacion no me sirve user sin nombre porque sera solo una instancia del navigador que provoco id cliente de socket : porque el servicio que genera conexion socket esta injectado en 
      // angular en componente principal que  permite que user al autenticarse al back mofidica la prop en este caso nombre que tomamos como refrerencia que realmente un user esta conectado y puede 
      // recibir en tiempo real notificaciones eventos
      return this.lista.filter( usuario => usuario.nombre !== 'sin-nombre' );
    }

    // Obtener un usuario por id
   getUsuario( id  ) {

        return this.lista.find( usuario => usuario.id === id );

    }

    // Obtener usuario en una sala en particular
    getUsuariosEnSala( sala  ) {

        return this.lista.filter( usuario =>usuario.sala === sala );

    }

    // Borrar Usuario
    borrarUsuario( id  ) {

        const tempUsuario = this.getUsuario( id );

        this.lista = this.lista.filter( usuario => usuario.id !== id );  // == false expulsado de la lista 

        //console.log(this.lista);

        return tempUsuario; // usuario borrado de la lista
        
    }


}


module.exports = UsuariosLista;