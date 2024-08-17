//Author: Johnathan Edward Brown August 16, 2024
//Made for utility usage for obfuscation from babel and then javascript-obfuscator with timed interval configuration for rotating obfuscation while keeping
//Secure communication channel to the obfuscated codes runetime through a obfuscated global communication channel method!
//Utilizing a Encapsulated Global class with its own private field with getter method to access!
//Must use the following at the beginning of ones server code for this utility to work!
/*
const app = express();
var listen = app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
process.stdout.on(GLOBALLY.getGlobalString(), ()=>{
  app.removeAllListeners();
  listen.closeAllConnections();
  listen.close();
  setTimeout(() =>{
  }, 1000);
});*/
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const vm = require('node:vm');
const fs3 = require('node:fs');
const path = require('node:path');
const JavaScriptObfuscator = require('javascript-obfuscator');
/** the Random Function as a function
 * @param {number} length - The length of the random string to generate
 * @returns {string} - The generated random string
 */
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

/**
     * @param {string} name - The name to remap
     * @param {Object} config - The configuration object
     * @returns {string} - The remapped variable name
     */
remapVariable = (name, config) => {
  if (config) {
    if (config.variables && config.variables.hasOwnProperty(name)) {
      return config.variables[name];
    } else if (config.envVars && config.envVars.hasOwnProperty(name)) {
      return config.envVars[name].name;
    }
  }
  return name;
};
//Author: Johnathan Edward Brown August 17, 2024
// Realized we could subclass this a little better
// Thanks to Vampeyer for reminding me of these simple design pattern usages!
// Also he pointed out a great article which related to variable scopage and how one can utilize the new es6 block scope setup to help encapsulate ones program execution scope!
// To prevent global backdoors! As well which we will ensure the obfuscated code process potentially does this for further protections!
class Run {
  #obby
  //New updated setup usage!
  //Which utilizes a built in private subclass in a private function to further encapsulate the obfuscated code in runtimes context!
  /**
  * @param {string} serverFile - The Server code to obfuscate
  * @param {number} timing - The Obfuscation Rotation Interval in ms
  * Changes Obfuscation based on @param {number} timing and Executes
  */
  constructor(serverFile, timing, UseEnv){
    this.#obby = this.#generateObby(serverFile, timing, UseEnv);
  }

  #generateObby(serverFile, timing, useEnvFile){
    //Author: Johnathan Edward Brown August 16, 2024
    //Originally made in June 5, 2014 //Without the class constructor setup and failed secured communication protocol! But was finished and kept by Nakamoto! For The usage on BTC Creation and success!
    //Which proves its value! To The Open Source community as Satoshi wanted to wait and see if it was a truly secure design pattern to faciliate and use against future increase in Pentesting Tools Technologies!
    //So Satoshi - Johnathan Edward Brown has decided to publicly release! For More Secure Public Servers! Due to the increasingly rising hacks!
    //Nakamoto Doesn't know we gonna suprise him with the reveal! But Nakamoto has majorly hinted towards the need for Satoshi to remake his core utility design and try again for better success!
    //Satoshi has set on journey to properly learn some core principles and security practices with NodeJS. Since Nakamoto was the Security Expert Truthfully and wanted to see.
    //Satoshi learn and grow and succeed in his quest!
    //and how they could be utilized again to Release this time around in a proper utility that people can utilize!
    //Brought back as a proper utility setup in a more secure manner with a parent obfuscation overtop the obby class!
    //As He Requested!
    //I Guess the World will still never realize Satoshi Nakamoto is a meaning for Intelligences Central which is to faciliate better security practices and principles, to achieve and thrive for growth in our Intelligence!
    /**
     * @param {string} serverFile - The Server code to obfuscate
     * @param {number} timing - The Obfuscation Rotation Interval in ms
     * Changes Obfuscation based on @param {number} timing and Executes
     */
    class Obby {
      #TheFile
      #timing
      #transformedCode
      #finalCode
      #GlobalReference
      #sandbox
      #context
      //We virtualize the Process By Duplicating the original, with encapsulation in the class object!!!
      //We now have a private process!!!
      //We now have a secondary process to prevent main process from attack surfaces! mwahahah!
      #process2
      #breakValue
      #timeOut
      #useEnv

      /**
       * @param {string} serverFile - The Server code to obfuscate
       * @param {number} timing - The Obfuscation Rotation Interval in ms
       * @param {boolean} useEnvFile - The Boolean flag that represents if true you are using env file if false you are not!
       * Changes Obfuscation based on @param {number} timing and Executes
       */
      constructor(serverFile, timing, useEnvFile){
          this.#useEnv = useEnvFile;
          if(useEnvFile){
            require('dotenv').config();
          }
          this.#breakValue = true;
          this.#process2 = process;
          this.#TheFile = fs3.readFileSync(path.join(process.cwd(), serverFile), 'utf8');
          this.#timing = timing;
          // Transform and execute
          this.#transformedCode = this.#transformCode(this.#TheFile);
          this.#finalCode = this.#obfuscateCode(this.#transformedCode);
          this.#GlobalReference = this.#generateGlobal();

          //const finalCode = obfuscateCode(transformedCode);
          //fs3.writeFileSync('./obbys/testObby.js', test);
          //fs3.writeFileSync('./obbys/babelified-debug.js', transformedCode); // Save transformed code
          //eval(transformedCode); // Use vm in production for better security
          //this.#runInVM(this.#finalCode, this.#GlobalReference);//Successful VM setup completed!
          this.#runInVM(this.#transformedCode, this.#GlobalReference);
          //console.log('environment', process.env);
      }
      //Yes I'm Class Encapsulation / Obfuscation / Rotation Crazy a Bit.....
      //An Encapsulated Global class
      //This adds an extra layer of security to ones communication channel context on process.stdout!
      //Author: Johnathan Edward Brown August 16, 2024
    
      #generateGlobal(){
        class JBGlobal {
          #GLOBAL_STRING
          constructor(){
            this.#GLOBAL_STRING = this.#generateRandomString(12);
          }
          /**Encapsulate the Random Function as a private function
           * @param {number} length - The length of the random string to generate
           * @returns {string} - The generated random string
           */
          #generateRandomString(length) {
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
          /**
             * @returns {string} - The global string
          */
          getGlobalString(){
           return this.#GLOBAL_STRING;
          }
        }
        //By giving the web server its own global context to communicate globally and have it obfuscated ensures extra security!
        //Quite literally this one is over kill but very important to protect the custom process.stdout communication channel context of the obfuscated controller to the web server!
        //Johnathan Edward Brown Waz here!!!
        return new JBGlobal();
      }
    
      //Encapsulate the function as private functions!
    
      /**
       * @param {string} code - The code to obfuscate
       * @returns {string} - The obfuscated code
       */
      #obfuscateCode(code) {
          return JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            identifiersPrefix: '',
            renameGlobals: true,
            selfDefending: true,
            splitStrings: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            target: 'browser',
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
            reservedNames: ['process.env', 'process.cwd()'] // Ensure process.env is not obfuscated
          }).getObfuscatedCode();
      }
      /**Encapsulate the Random Function as a private function
       * @param {number} length - The length of the random string to generate
       * @returns {string} - The generated random string
       */
      #generateRandomString(length) {
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
      /**
       * @param {Object} ast - The abstract syntax tree
       * @returns {Object} - The generated configuration object
       */
      #generateConfig(ast) {
          const config = {
            variables: {},
            functions: {},
            envVars: {}
          };
          if (this.#useEnv){
          const envContent = fs3.readFileSync('.env', 'utf8');
          const envVars = envContent.split('\n')
            .filter(line => !line.startsWith('#'))
            .reduce((acc, line) => {
              const [key, value] = line.split('=');
              const newname = this.#generateRandomString(12);
              acc[key.trim()] = { name: newname, value: value.replaceAll('\"', "").trim() };
            
              return acc;
            }, {});
          
          config.envVars = { ...envVars };
          }
          
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

      /**
       * @param {string} code - The code to transform
       * @returns {string} - The transformed code
       */
      #transformCode = (code) => {
          const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['classPrivateMethods', 'classPrivateProperties']
          });
        
          const config = this.#generateConfig(ast);
        
          Object.keys(config.envVars).forEach(key => {
            //console.log('original env',key,'\n', process.env[key], '\nNew env',config.envVars[key].name,'\n',config.envVars[key].value);
            process.env[key] = "";//Clears out the original process.env values!!! For Proper securit precautions!!!
            process.env[config.envVars[key].name] = config.envVars[key].value;
            //console.log('Test:',process.env[config.envVars[key].name],'\n', config.envVars[key].value);
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
    
      #rotateObby() {
          //Re creates Secondary Process for a Refresh of the potentially infected process!
          this.#process2 = process;
          //Properly rotates the globally communication channel!
          const middleTransformedCode = this.#transformCode(this.#TheFile);
          //const finalTransformedCode = obfuscateCode(middleTransformedCode);

          //return finalTransformedCode;
          return middleTransformedCode;
      }
      
      /**
       * @param {string} code - The code to run in a VM
       * @param {string} GLOBALLY - The Global Object to use communication process securely!
       * Utilizes proper scope passage of the Global communication process string!
       */
      #runInVM(code, GLOBALLY){
        if (this.#breakValue){
        //console.log('Running context with process.env', process.env);
          // Create a sandbox with the necessary modules and variables
          this.#sandbox = {
              process: {
                  env: this.#process2.env,
                  stdout: this.#process2.stdout,
                  stderr: this.#process2.stderr,
                  cwd: this.#process2.cwd
              },
              path,
              fetch,
              console,
              require,
              setTimeout,
              setInterval,
              clearInterval,
              clearTimeout,
              Buffer,
              global: {},
              GLOBALLY,
          };

          // Add necessary global variables and functions
          this.#sandbox.global = this.#sandbox;
          // Create a context from the sandbox
          this.#context = vm.createContext(this.#sandbox);
          // Execute the code in the context
          console.log('Starting context run!');
//          fs3.writeFileSync('./output.js', code);
          try {
          vm.runInContext(code, this.#context);
          }catch(err){
            //console.log('Error:', err);
          }

          this.#timeOut = setTimeout(() => {
              console.log('Stopping VM...');
              try {
              this.#sandbox.process.stdout.emit(GLOBALLY.getGlobalString());
              this.#GlobalReference = this.#generateGlobal();
              }catch(err){
              
              }
              this.#runInVM(this.#rotateObby(), this.#GlobalReference);
          }, this.#timing);
        }else{
          return;
        }
      }
    
      getTimeout(){
        return this.#timeOut
      }

      setBreak(){
        this.#breakValue = false;
      }

      terminate(){
        this.#sandbox.process.stdout.emit(this.#GlobalReference.getGlobalString());
      }
    }

    return new Obby(serverFile, timing, useEnvFile);
  }

  break(){
    clearTimeout(this.#obby.getTimeout());
    this.#obby.setBreak();
    this.#obby.terminate();
  }

}

//Author: Johnathan Edward Brown August 16, 2024
module.exports = {
  Run
}