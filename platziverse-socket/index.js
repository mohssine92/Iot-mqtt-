const debug = require('debug')('platziverse:socket')
const Server = require('./classes/server');
const chalk = require('chalk')



server = new Server();

server.start( () => {
  
  debug(`${chalk.green('server listening on port : ') + server.port }`)
 
});


