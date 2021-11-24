- 27: Definición de un Broker de Mensajería
      Platziverse MQTT va a ser el servidor encargado de recibir los mensajes de los agentes de monitoreo y re-distribuírlos a los agentes que estarán “escuchando” o a la 
      espera de esos mensajes.
      Un “message broker” es decir un intermediario que se encargará de recibir un mensaje y redistribuírlo para esto nosotros vamos a implementar el protocolo MQTT para que realice   esta función en nuestro servidor por las ventajas que este ofrece al estar optimizado para aplicaciones de IoT este protocolo “máquina a máquina” utiliza un ancho de banda muy   bajo y puede funcionar con conexiones móviles y situaciones de ese estilo dónde el ancho de banda es limitado en muchas ocaciones y el consumo de datos debe ser lo más bajo   posible.

- 28: Definición de los tipos de mensajes       
      Antes de empezar con la implementación de nuestro servidor de MQTT debemos definir el tipo de mensajes que vamos a utilizar.
      Crearemos un archivo readme en nuestra carpeta “platziverse-mqtt.”
      Vamos a utilizar un eventoopara cuando el usuario se conecte para esto utilizamos “agent/connected” además utilizaremos “agent/disconnected” para cuando el agente se deconecte y por último un evento para cuando nos envíen un mensaje “agent/message”.

      - cual son los tipos de mensajes que nosotros vamos a trabajar 
     
      nostros vamos a crear un agente , ese agente se va a conectar a nuestro servidor pues nosotros necesitamos un mensaje que diga que el agente se conecto
      ## `agent/connected`

      estrucrura de objeto agente connectado 
      esta es la informacion que vamos a inviar al servidor mqtt
      ```js 
       {
         agent: {
           uuid, // auto generar - cuando estemos creando el agente 
           username, // definir por configuración ...
           name, // definir por configuración ...
           hostname, // obtener del sistema operativo - hostname del agente 
           pid // identificador del proceso  obtener del proceso 
         }
       }

      ```

      nostros vamos a manejar evento cuando un agente se desconecte
      ## `agent/disconnected`
      obtenr la informacion del agent y solo va inviar el uuid
      nostros para marca agent como desconectado solo necesitamos uuid , recordar que tenemos funciones en el modul de db para hacer la tarea (esto lo vamos a integra con
      nuestro api y el resto de componentes que vamos a desarollar mas adelante)
      ```js
        {
          agent: {
            uuid
          }
        }
      ```

      nostros vamos a querer un event cada vez ese agente nos mande un mensaje
      ese mensaje la que va tener metricas que el agente va reportar 
      ## `agent/message`
      mensaje de agent va ser object de js  que va contener la informacion del agente , areglo metricas
      - como seria las metricas : depende de la cantidad de metricas que he configurado a mi agent , esto va ser custumizado , usted va transmitir la memoria y la memoria
        la va calcular asi de manera similar a la temperatura, los agentes van a ser flexibles a la hora de definir que metricas vamos a reportar : na9l 
      ```js
       {
          agent,
          metrics: [
            {
              type,
              value
            }
         ],
         timestamp // generar cuando creamos el mensaje
       }

       principalmente lo vamos a hacer almacenar estos mensajes en db utulizando nuestro modulodb y restrubuir a aquellos esten conectados a nuestro servidor mqtt 
      ```


- 29 : Implementación del servidor MQTT
       - Vamos a comenzar con la implementación de nuestro servidor de MQTT.
         Por defecto el puerto donde va a correr el servidor MQTT es el 8083.


- 30 : Cómo recibir mensajes
       Ya tenemos implementado el servidor, pero hasta ahora no sabemos cómo recibir mensajes, ya sea cuando un cliente se conecta, o cuando hay un mensaje.   
       - instalamos un herramienta de mqtt: (cliente mqtt) que vamos a usar para aprobar nuestro message broker 
         atraves esta herramiendo podemos ejecutar comando pub , sub , -h recibe donde aloja messag broker , hay otras opcines es usar broker de otra persona
         y interecruar con el .

- 31 : Cómo integrar el servidor MQTT con la base de datos
       hay muchas formas de publicar nuestro módulo. En este caso vamos a referenciarlo como un módulo local.         
       si hubiero publicado en npm , lo podemos instala del npm como cualquier otro modulo
       * dependencias local : en este caso modulo db , hago la ref en el package de este modulo y ejecuto npm install 
         va ser un enlace simbolico en node_modules : si ectualizamos esta dependencia local se lo va a actualizar automaticamente en nuestro node_modules