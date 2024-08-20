//Author: Johnathan Edward Brown August 17, 2024
//Made for utility usage for obfuscation from babel and then javascript-obfuscator with timed interval configuration for rotating obfuscation while keeping
//To Obfuscate the obfuscator and rotator class in runetime!
class pObby {
    #TheFile
    #Obbied
    #privateObject
    #serverFile
    #timing
    #importTiming
    #useEnv
    #timeOut
    #breakValue
    /**
    * @param {string} serverFile - The Server code to obfuscate
    * @param {number} timing - The Obfuscation Rotation Interval in ms
    * @param {number} importtiming - The Obfuscation timing for importing!
    * @param {boolean} useEnvFile - Are you using .env file? if so true! if not false!
    * 
    * Changes Obfuscation based on @param {number} timing and @param {number} importTiming and Executes Server Code!
    *
    * Must use the following at the beginning of ones server code for this utility to work!
    * const app = express();
    * var listen = app.listen(3001, () => {
    *   console.log('Server is running on http://localhost:3001');
    * });
    * process.child.on(GLOBALLY, ()=>{
    *   console.log('Child Killed Recieved!');
    *   app.removeAllListeners();
    *   clearInterval(i1); //Clear any intervals or timeouts as well!
    *   listen.closeAllConnections();
    *   listen.close();
    *   setTimeout(() =>{
    *   }, 1000);
    * });
    */
    constructor(serverFile, timing, importTiming, useEnvFile, aObby){
        const fs3 = require('fs');
        const path = require('node:path');
        this.#breakValue = true;
        this.#useEnv = useEnvFile;
        console.log(path.join(__dirname, 'Obby.js'));
        //One time load up to prevent modifications to the original runetime of said obby.js!
        this.#TheFile = fs3.readFileSync(path.join(__dirname, 'Obby.js'), 'utf8');
        this.#Obbied = this.#obfuscateCode(this.#TheFile);
        //console.log('Obfuscated code:', this.#Obbied);
        fs3.writeFileSync(path.join(__dirname, 'Obbiefed.js'), this.#Obbied, 'utf-8');
        const { Run } = require(path.join(__dirname, 'Obbiefed.js'));
        setTimeout( () => {
            fs3.unlinkSync(path.join(__dirname, 'Obbiefed.js'));
        }, 100);
        //WE now have a private sub class!
        this.#serverFile = serverFile;
        this.#timing = timing;
        this.#importTiming = importTiming;
        this.#privateObject = this.#generatePrivateSubClass(serverFile, timing, Run, useEnvFile);
        if ((aObby === undefined || aObby === null) && aObby != true){
        this.#timeOut = setTimeout(() => {
            this.#rotateObby();
        }, importTiming);
    }
    }

    #rotateObby(){
        const fs3 = require('fs');
        const path = require('node:path');
        if (this.#breakValue){
        console.log('Rotating Obby import!');
        this.#Obbied = this.#obfuscateCode(this.#TheFile);
        fs3.writeFileSync(path.join(__dirname, 'Obbiefed.js'), this.#Obbied, 'utf-8');
        const { Run } = require(path.join(__dirname, 'Obbiefed.js'));
        setTimeout( () => {
            fs3.unlinkSync(path.join(__dirname, 'Obbiefed.js'));
        }, 100);
        this.#privateObject.getRun().break();
        //We now have a private sub class! Thanks to the Johnnykins! Johnathan Edward Brown, August 17, 2024 1:32 AM Eastern Daylight Savings Timezone
        this.#privateObject = this.#generatePrivateSubClass(this.#serverFile, this.#timing, Run, this.#useEnv);
        this.#timeOut = setTimeout(() => {
            this.#rotateObby();
        }, this.#importTiming);
        }else{
            return;
        }
    }

    #generatePrivateSubClass(serverFile, timing, Run, useEnv){
        //Private Sub Class
        class PrivateSubClass {
            #run

            constructor(serverFile, timing, useEnv){
                this.#run = new Run(serverFile, timing, useEnv);
            }

            getRun(){
                return this.#run;
            }
        }
        return new PrivateSubClass(serverFile, timing, useEnv);
    }

    //Encapsulate the function as private functions!

    /**
     * @param {string} code - The code to obfuscate
     * @returns {string} - The obfuscated code
     */
    #obfuscateCode(code) {
        const JavaScriptObfuscator = require('javascript-obfuscator');
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
          stringArrayEncoding: ['base64', 'rc4'],
          stringArrayThreshold: 1,
          target: 'browser',
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
          reservedNames: ['process.env', 'process.cwd()', 'Run'] // Ensure process.env is not obfuscated
        }).getObfuscatedCode();
    }

    /*
    Allows the user to close the parent obfuscator! And child obfuscator utility!
    */
    break(){
        //We Clear the timeout!
        clearTimeout(this.#timeOut);
        //We set our custom break intercept to false!
        this.#breakValue = false;
        this.#privateObject.getRun().break();
    }
}

//Author: Johnathan Edward Brown August 19, 2024
class RunPObby {
    #pObby
    //New updated setup usage!
    //Which utilizes a built in private subclass in a private function to further encapsulate the obfuscated code in runtimes context!
    /**
    * @param {string} serverFile - The Server code to obfuscate
    * @param {number} timing - The Obfuscation Rotation Interval in ms
    * @param {number} importtiming - The Obfuscation timing for importing!
    * @param {boolean} useEnvFile - Are you using .env file? if so true! if not false!
    * 
    * Changes Obfuscation based on @param {number} timing and @param {number} importTiming and Executes Server Code!
    *
    * Must use the following at the beginning of ones server code for this utility to work!
    * const app = express();
    * var listen = app.listen(3001, () => {
    *   console.log('Server is running on http://localhost:3001');
    * });
    * process.child.on(GLOBALLY, ()=>{
    *   console.log('Child Killed Recieved!');
    *   app.removeAllListeners();
    *   clearInterval(i1); //Clear any intervals or timeouts as well!
    *   listen.closeAllConnections();
    *   listen.close();
    *   setTimeout(() =>{
    *   }, 1000);
    * });
    */
    constructor(serverFile, timing, importTiming, useEnvFile){
      try {
      this.#pObby = new pObby(serverFile, timing, importTiming, useEnvFile);
      }catch(err){
        console.log(' RunPObby Err:', err);
        setTimeout(()=>{
            console.log('Fixing dont worry! Johnnykins Got your back!');

          }, 1000);
      }
    }

    get(){
        return this.#pObby;
    }
}


module.exports = {
    pObby,
    RunPObby
}