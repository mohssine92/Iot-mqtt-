'use strict'


function pipe (source, target) {
    if (!source.emit || !target.emit) {
      throw TypeError(`Please pass EventEmitter's as argument`)
    }
  
    const emit = source._emit = source.emit
  
    source.emit = function () {
      emit.apply(source, arguments)
      target.emit.apply(target, arguments)
      return source
    }
}


module.exports = {
  pipe
}




/// resuma trabajo , todos evento del agente  disparados internamente los vaya enviando  al socket server  es lo que hace este pipe 
 // this.agent.on('agent/connected', payload => { 
      //   this.io.emit('agent/connected' , payload)
      //   console.log(payload);
      // })
      
      // this.agent.on('agent/message', payload => {
      //    this.io.emit('agent/message' , payload)
      //    console.log(payload);
      // })

      // this.agent.on('agent/disconnected', payload => {
      //    this.io.emit('agent/disconnected' , payload)
      //    console.log(payload);
      // })
