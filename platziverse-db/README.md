# Modulo de base de  datos :  platziverse-db
# platziverse-db : es un modulo - lo describe package.json

 - 11 . Estructura basica del modulo de Node.js

# usage : del modulo

``` js
 * este modulo me va returna una funcion  la que le paso un objeto de configuracion(variables de entorno y dialecto)
 * al connectarse a un db relacional sea segun objeto de config (mysql , postgresAQL , etc ..)  , then de la promise me returna Objeto de la db el cual expone objetos de Modelos configurados y testeados 
 * db : Object desestructuracion de dos objetos Modelos (pueden ser mas segun el proyecto y la configuracion de entidadesd , entidades relacion etc .. )   
 * ya con los servicios Agent y Metric puedo intrectuar con la base de datos 

   const setupDatabase = require('platziverse-db');

   setupDatabase(config).then( db => {
     
     const {Agent , Metrica} = db 
   
   }).catch(err => console.log(err))



```
* 11 . (standar dependencia) 
  correr los script de npm 
  - npm run lint : este comando lo ejecuto despues de terminar la implementacion de algun modulo para verificar si tengo algun err
    este comando de lint ejecuta modulo dependencia de standar : (tener buen practicas al momento de escribir js ) (busca errores , define codigo de estilo que muchos desarolladores han atado)
    npm run lint -- --fix : arreglar los errores automaticamente

* 12 . Lo primero que tenemos que hacer es definir las entidades de las bases de datos que vamos a utilizar. En nuestro proyecto vamos a usar PostgreSQL, una base de datos relacional
      - definir entidades : para este proyecto nosotros usamos una libreria se llama - sequelize - es una libreria ofrece un aabstraccion de varias db sql y atraves de utulizar Objetos js podemos definir nuestros modelos 
        por decirlo asi de base de datos y el automaticly va a crear si estas tablas no existe (utulizando sequelize creando estos modelos y ... usando Objetos de js )
      - El Agente va a conectarse al servidor en tiempo real y cada cierto tiempo va a reportar una métrica.
        La Métrica es cualquier valor que tiene un tipo, que va a ser almacenado en la base de datos.  
  
* 13 - Implementación de modelos con sequelize
       Sequelize es un modelo de programación de mapeo de objeto-relacional basado en promesas, para Node.js.
       Dos tipos de objetos: modelos nativos de sequelize y servicios.
       Singleton es un objeto que solo tiene una instancia. Cada vez que llamemos a una función no va a crear múltiples instancias.
       - vamos a tener 2 tipos de objetos : uno para hacer modelos nativos de sequelize y otro para hacer los servicios .
       * crear objeto de sequelize _ para luego usar este objeto de sequilize para crear nuestros modelos . 

* 14 - Implementación de un módulo básico de base de datos
       Vimos cómo definimos los modelos en el video pasado. Ahora vamos a ver cómo podemos relacionar los modelos entre si.
       Primero vamos a necesitar las funciones que definimos anteriormente. Para poner a interactuar los modelos entre si debemos hacer la configuración de la base de datos y los modelos. 

* 15 - Implementación de script de inicialización de base de datos
       Cuando ejecutemos el proyecto por primera vez necesitaremos tener creada la base de datos, y crear un usuario con permisos(usando gestor de la db que vamos a usar ) para alimentar esa base de datos.
       para eso creamos un script que encarga hacerlo : npm run stup   (no olvida connectar server de la db a la red PgAdmin) => en este caso PostgreSQL 

* 16 - Creando una advertencia sobre el borrado de base de datos
       Después de haber creado el script, cada vez que lo ejecutamos vamos a borrar la base de datos. Como esto puede ser peligroso vamos a preguntarle al usuario si está seguro de esto. Vamos a crear un prompt que haga una confirmación de ejecución del script de inicialización. (por eso instalamaos un modulo se llama : npm i inquirer )  (npm i chalk : es un modulo para estizar textos en cosola )
       - Cuando hay un error, como por ejemplo pasar mal la contraseña, no debería permitirnos avanzar con el script. Hay una parte de la configuración de PostgreSQL en la que por defecto tiene unos parámetros trust, que permiten autenticación sin  password. Es importante que tengas en cuenta esto y hagas el ajuste.

* 17 - Introducción a pruebas unitarias con Ava.js 
       Ava.js es un test runner que permite definir cada uno de los tests de nuestra app y soporta ECMAScript 2016.
       npm install --save-dev ava 
       npm test (ejecutar los tests)

* 18 - Test coverage es una técnica que permite ver si los tests que hemos creado están cubriendo el código de nuestra aplicación, y si están siendo considerados en las pruebas. El resultado será un porcentaje, que nos va a decir cuánto del código
       está siendo abarcado. Lo ideal es mantener el código al 100%. 
       npm i nyc --save-dev (nyc va ser encargado de ejecutar suit de pruebas de esta manera dara cuenta del porcentaje de funciones que he cubierto en mis pruebas  ) porque yo voy aprobando las funciones que quiero
       es decir si no apruebo una funcion que envoca en el proceso me lo marca en rojo : reclamando a mo que no he aprobado tal funcion 
       tener : un coverage de 100% es decir que las pruebas estan bien implementadas


* 19 - Cómo hacer Mocks y Stubs con Sinon
       Vamos a crear unos servicios que van a utilizar unos modelos, y estos son los que se van a conectar a la base de datos. Sequelize se encarga de probar los modelos.


* 20 - Creación de fixtures y definición básica del servicio de Agent
       Antes de implementar las funciones del servicio Agent vamos a definir los fixtures.

* 21 - Implementación de findbyId y pruebas en el servicio Agent        

* 22 - Implementación de createOrUpdate

* 23 - Revisión del servicio Agent
       Ya aprendimos a implementar pruebas unitarias. Ahora haremos la revisión de las funciones que implementamos para entender cómo se creó el servicio completo.
       Para implementar las pruebas de las funciones se definen unos argumentos que se reutilizan para trabajar con nuestros stubs, y creamos unas nuevas tambié

* 24 - Implementación del servicio Metric
       El servicio Agent lo que hace es reportar unas métricas cada cierto tiempo. Para implementar el servicio Metric vamos a necesitar tres funciones asíncronas:
       - create: Que va a recibir dos parámetros: el ID del agente y la métrica.
       - findByAgentUuid: En el que vamos a hacer una consulta que va a buscar todas las métricas cuyo AgentId es igual al
       - findByTypeAgentUuid: Que va a buscar por tipo de métrica y por AgentId.

* 25 : Realizando un ejemplo con el módulo de base de datos
       Ahora vamos a crear un script con el modelo que hicimos para interactuar directamente con la base de datos.       
       pgAdmin : se accedemos a la base de datos en remoto con  millones de registros jamas listamos todos los datos - eso tumba la db
       va hacer caer la db , es un err grande , podemos limit ver solo los 200 ultiomos primeros etc ..


* 26 : Nosotros creamos un script de la configuración de la base de datos. Este script lo vamos a querer ejecutar de forma automatizada. Más adelante cuando estemos haciendo deploy
       ese script no lo va a ejecutar un humano.  (este script crear y inicia base de datos)
       asi ese script pregunta el servidor de deply - el servidor obviamente no va a contestar - nosotros la ejecuccion automatizada en deply debemosejecutar script con un flag
       si lo recibe script valor de flag evalua y salta prompt esto es todo 
       node setup.js --y (de esta manera arg al script que estamos ejcutando )        