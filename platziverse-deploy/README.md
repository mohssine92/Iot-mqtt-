´´´
  Docker
 
  1 - contenedor por dentro ?

  docker run hello-world  : crea container y lo ejecuta
  docker run --name platzi  hello-world  : crear container y asignarle nombre (docker no permite tener 2 container con mismo nombre ..)
  docker rename platzi udemy : renombrar container 
  docker ps : ver contenedor que estan corriendo ahora mismo 
  docker ps -a : ver todos contenedores 
  docker inspect 200c6918389e : ver mas inf sobre container 
  docker rm platzi : eleminar container :-- pasa nombre o --id
  docker container prune : delete all container stopped

  docker run ubuntu : crear container ubunto linux ejecutar y pagar en breve 
  docker run -it ubuntu : enchufar al sheel de ubunto creado y levantarlo :  root@1ce0cf4e42f2:/# - ver version ubuntu : cat /etc/lsb-release es un proceso

  docker run --name platziverse -d ubuntu tail -f /dev/null : crear containeer ... y sigue ejecutandose el proceso hasta que lo pagamos proceso principal
  docker exec -it platziverse bash : accedder al mismo atraves nombre del container y correr un shell (estoy dentro de ubunto ) corriendo un proceso shell 
  root@86e4da2f264d:/#  ps : ver procesos : bash y  principal
  root@86e4da2f264d:/# ps aux : ver todos procesos en este container
  exit : es salir del proceso de bash np del tail sigue ejecutando
  docker ps : ver que containers  sigue ejecutandose 
  

  *contenedor desde afuera ? 
  usuario del container :

   docker run -d --name proxy nginx : este container esta escuchando en puerta 80 del container no es puero 80 de mi systema operativo
   docker stop proxy : frenar container , docker ps 
   docker rm -f platzi : lo frena y lo borra 

   2 - exponer puerto de nginx del container a un puerto de mi maquina :
        docker run --name proxy -p 8080:80 nginx : crear container y exporta ... important no debe existir container con nombre proxy 
        -p lo pone en output ver localhost:8080  -- C-c termibnar proceso 
        docker rm proxy 
        docker run --name proxy -d -p 8080:80 nginx : ... sin output en terminal  (localhost:8080 disponible )
        docker logs proxy : puedo vero todos logs de la peticion que hize 
        docker logs -f proxy : verlos en timpo real la terminal esta enchufada output
        docker logs --tail 10 -f proxy : ver solo los 10 ultimos 
        => lo que hizimos estamos en container proxy exponiendole al mundo exterior al puerto de mi maquina 8080 asique de esa manera proceso de nginx
           todos trafico que entra por puerto 8080 de mi maquina se va al puerto de 80 del container proxy . gracias al vinculacion de los puertos  
  
   3 - intercambio de archivos entre mi maquina mac osx y container como sea nginx o ubunto o db  etc ... manejo de datos
       docker run -d --name db mongodb :....container de db mongodb crearlo y correrlo 
       docker exec -it db bash : entrar a ese contenedor para generar datos en este container usar shell  proceso shell
       binario viene dentro del container  es cliente de db ejecutar : mongo : estoy en db => ejecutar coamandos mongo
       comandos db :  use paltzi -   db.users.insert({"name":"moss"}) - db.users.find()
       docker rm -f db : matar eleminar : si creo de nuevo mismo contenedor los datos no existen mas : contenedor fue borraro 

       Resolver el prob : la idea es montar directorio sobre contanedor - asociarlo a un path en el contenedor asi todo se desplega al directorio 
       montado y asi si eliminamos container y cremos nuevo y le montamos  la carpeta  obtenemos todos disponile video 12 .
       mkdir mongoda
       pwd : /Users/mohssinelmariouh/Desktop/dockerdata/mongoda : path en mi mmaquina mac osx donde me ubico
       docker run -d --name db -v /Users/mohssinelmariouh/Desktop/dockerdata/mongoda:/data/db mongo :=> /data/db mongo : path en contenedor donde guarda...
       docker exec -it db bash : access to .. container process 
       mongo : binario mongodb 
       use platzi : coamndo mongodb
       db.users.insert({"nombre":"mohssine"}) : generar data ...
       db.users.find()
       exit 
       mongoda % docker rm -f db  : matar 
       e mongoda % ls => munton de arcivos desplegados desde container db to carpeta este , asi si monto otro container db y montarle ese mismo directorio voy a tener la informacion disponible . aqui vemos concepto exponer data del container a la maquina y maquina al container .
       docker run -d --name db -v /Users/mohssinelmariouh/Desktop/dockerdata/mongoda:/data/db mongo . video 13

    4 - volumenes  vide 14 
        docker volume ls : ver que volumunes hay 
        docker volume  create dbdata : crear un volumns (docker ya reservo espacio en disco y lo esta manejando el doker es un volumne   ) 
        proceso similar que lo de antes montar directorio - la ventaja de este es toda la data esta en un volumne administrado por docker seguro
        yo no se que archivo y ningun otro usuario del sistema sabra y puede ver que archivos hay. 
        asi que es otra manera muy practica de manejar archivos data entre contenedores sin necesidad de estar compartiendo un dirctorio como hizimos la vez pasada :
        docker run -d --name db --mount src=dbdata,dst=/data/db mongo  : crear container montarle ese volumne en el directorio donde la db escribe sus datos en el container db  
        luego lo mismo que antes crear data , elemnar container , montar otro nuevo y montarle mismo volumne
        docker inspect db  : ver inf del container : Mounts : inf de volumne que he creado (coamdo de ejeuccion dentro del container )
      
    5 - vide 15 :  introducir archivos o extraer archivos a un container sin usar ninguna de las opcciones anteriores solo usado los siguiente comandos :
        
        touch prueba.text : crear archivo en mi filsystem mac osx 
        docker run -d --name copytest ubuntu tail -f /dev/null  : runing new container y mantenerle activo con este comando
        docker ps : ver los container activos - docker ps -a => ver all conaitner tanto activos como pagados 
        docker exec -it copytest  bash  : acceder al container ajucantando proceso de bash 
        root@e8bbd89b8cfe:/#  mkdir testing  : creat a directory on container runing image ubuntu 
        root@e8bbd89b8cfe:/#  exit : salir del container 
        docker cp prueba.txt copytest:/testing/test.txt =>  insertar prueba.txt desde filsystem hacia un path del container  
        acceder nuevamente al container y vas a encontrar archivo insertado 
        exit
        docker cp copytest:/testing localtesting => viceverza copia lo que tiene en el container en tal directorio al directoria estamos y nomrmalo localtesting 
        paraque vea viceversa y si se puede desplazar tanto archivos como contenedorescarpetas .  (se puede extraer del continer pagado al filesystem)
  
        +++ hasta aqui hemos terminado como se manejan datos en docker . 1-15

    6 - imagenes 
        docker image ls : ver imagenes de nuestro entorno local 
        docker pull ubuntu:20.04  : traer imagen desde un repo externo hacia mi maquina mac osx por defecto usa repo publico hub.docker puede especificar otro 

        crear imagen propia . video 17 - apartir de la imagen se crean los contenedores 
        Dockerfile ver 
        todo que  escribimos en dockerfile se ejcuta en tiempo de build de la imagen 
        docker build -t ubuntu:mos . => construir image de tagle platzi punto es decir el contexto de build que va ejecutar proceso  esta en este directorio  
        docker image ls : ver las images existentes
        docker run -it ubuntu:mos  : crear nuevo contenedor apartir de imagen que creamos recien 
        root@938387e1491f:/# ls /usr/src : listar este archivo creado en tiempo de build de la imagen  RUN touch /usr/src/hola-platzi.txt
        docker login -u mohssine92 : logear cli 
        ahora bien tenemos nueva imagen personal la forma de compartir con otras personas es publicandola en el repo despues de loguear obviamente 
        docker tag ubuntu:mos mohssine92/ubuntu:mos => cambiar nombre obvio no puedo pushear versionese en repo oficial de ubuntu 
        docker image ls >= ver new tag 
        docker history ubuntu:platzi : en caso no tenemos visible dockerfile de una iamgen ... para ver con que capaz esta construido 
        mas info video 18 instalacion dive : mas infomrmacion de capa los cambios generados en filesystem de la imagen generada ... 
        dive ubuntu:mos : ver info de la iamgen y sus capaz  usando dive 
        - la idea hecho un build de image en tiempo de build he credo un arechivo en filesystem de la imagen que ejecutan  containers : es decir es una capa 
          luego modifique dockerfile de la imagen ejecutando Run .. eleminado dicho archivo y despues ejecutando el build de la imagen es decir segunad capa de lla imagen .
          esto es el concepto de las capaz de cierta imagen que construimos : las capaz presentan lo cambios en tiempo de build .

 
    




 

       
     



       



       

´´´