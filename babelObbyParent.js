const vm = require('vm');
const fs3 = require('fs');
const { obfuscateCode } = require('./finalObbyParent.js');
const code = fs3.readFileSync('./babelObby.js', 'utf8');
// Transform and execute
const test = obfuscateCode(code);
fs3.writeFileSync('./obbys/testParentObby.js', test);
//eval(transformedCode); // Use vm in production for better security
runInVM(test);//Successful VM setup completed!


function runInVM(code){
// Create a sandbox with the necessary modules and variables
const sandbox = {
    process: {
        env: process.env,
        stdout: process.stdout,
        stderr: process.stderr
    },
    fetch,
    require,
    setTimeout,
    setInterval,
    clearInterval,
    clearTimeout,
    Buffer,
    global: {},
};

// Add necessary global variables and functions
sandbox.global = sandbox;
// Create a context from the sandbox
const context = vm.createContext(sandbox);
// Execute the code in the context
console.log('Starting context run!');
try {
vm.runInContext(code, context);
}catch(err){

}
}