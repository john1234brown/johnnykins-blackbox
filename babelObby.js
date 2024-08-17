const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const vm = require('vm');
const fs3 = require('fs');
//require('dotenv').config();
const { obfuscateCode } = require('./finalObby.js');
const timer = (1 * 10 * 1000);
//This stores the string used to communicate across process.stdout to the webServer to stop it to reObfuscate!
const GLOBAL_STRING = generateRandomString(12);
//This stores the Reobfuscated Reference for the variable above! in program!
const GLOBAL_REFERENCE = '';

const code = fs3.readFileSync('./index.js', 'utf8');

function generateRandomString(length) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  let randomString = '';
  const firstCharIndex = Math.floor(Math.random() * letters.length);
  randomString += letters[firstCharIndex];
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
}

function generateConfig(ast) {
  const config = {
    variables: {},
    functions: {},
    envVars: {}
  };

  const envContent = fs3.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      const newname = generateRandomString(12);
      acc[key.trim()] = { name: newname, value: value.replaceAll('\"', "").trim() };

      return acc;
    }, {});

  config.envVars = { ...envVars };

  traverse(ast, {
    VariableDeclaration(path) {
      path.node.declarations.forEach(decl => {
        if (decl.id.name && decl.id.name.toUpperCase() === decl.id.name) {
          config.variables[decl.id.name] = generateRandomString(12);
          console.log('Variable name:', decl.id.name, config.variables[decl.id.name]);
        } else {
          config.variables[decl.id.name] = decl.id.name;
        }
      });
    },
    FunctionDeclaration(path) {
      config.functions[path.node.id.name] = path.node.id.name;
    }
  });

  return config;
}

const remapVariable = (name, config) => {
  if (config) {
    if (config.variables && config.variables.hasOwnProperty(name)) {
      return config.variables[name];
    } else if (config.envVars && config.envVars.hasOwnProperty(name)) {
      return config.envVars[name].name;
    }
  }
  return name;
};

const transformCode = (code) => {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['classPrivateMethods', 'classPrivateProperties']
  });

  const config = generateConfig(ast);

  Object.keys(config.envVars).forEach(key => {
    process.env[key] = "";//Clears out the original process.env values!!!
    process.env[config.envVars[key].name] = config.envVars[key].value;
  });

  fs3.writeFileSync('config.json', JSON.stringify(config, null, 2));

  traverse(ast, {
    Identifier(path) {
      const nodeName = path.node.name;
      if (nodeName.startsWith('process.env.')) {
        const envVarName = nodeName.split('.')[2];
        const remappedName = remapVariable(envVarName, config);
        if (typeof remappedName === 'string') {
          path.node.name = `process.env.${remappedName}`;
        }
      } else {
        const remappedName = remapVariable(nodeName, config);
        if (typeof remappedName === 'string') {
          path.node.name = remappedName;
        }
      }
    }
  });

  return generate(ast).code;
};

const transformCodeRemoveConsoleLogs = (code) => {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['classPrivateMethods', 'classPrivateProperties']
  });

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'console' &&
        ['log', 'error'].includes(callee.property.name)) {
        path.remove();
      }
    }
  });

  return generate(ast).code;
};
// Transform and execute
const transformedCode = transformCode(code);
//const test = obfuscateCode(transformedCode);
//fs3.writeFileSync('./obbys/testObby.js', test);
//fs3.writeFileSync('./obbys/babelified-debug.js', transformedCode); // Save transformed code
//eval(transformedCode); // Use vm in production for better security
//runInVM(test);//Successful VM setup completed!
runInVM(transformedCode);
function runObby(){
    endObby();
}

function rotateObby() {
  const middleTransformedCode = transformCode(code);
//  const finalTransformedCode = obfuscateCode(middleTransformedCode);
//  return finalTransformedCode;
  return middleTransformedCode;
}

function endObby(){
    console.log('EventEmitter ended!');
//    eventEmitter.emit(Special_Global_String);
}

function runInVM(code){
// Create a sandbox with the necessary modules and variables
const sandbox = {
    process: {
        env: process.env,
        stdout: process.stdout,
        stderr: process.stderr
    },
    fetch,
    console,
    require,
    setTimeout,
    setInterval,
    clearInterval,
    clearTimeout,
    Buffer,
    global: {},
    GLOBAL_STRING
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

setTimeout(() => {
    console.log('Stopping VM...');
    try {
    sandbox.process.stdout.emit(GLOBAL_STRING);
    }catch(err){

    }
    runInVM(rotateObby());
}, 15000);
}