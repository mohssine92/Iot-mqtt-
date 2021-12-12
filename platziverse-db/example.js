// longjohn nos da inf sobre el err  stack3  del loop async - no es recomendale su uso en produccion 
require('longjohn')
setTimeout(() => {
    throw new Error('boom')
}, 2000);