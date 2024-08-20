//TODO: Encapsulate the pObby.js in a Class from aObby and obfuscate the pObby the same way we do from pObby to Obby
// This will create 3 dimensions aka layers to help further protect the obfuscation runtime! From interference and the webserver running inside this blackbox!
// From potential SSRF attacks when the server is infected and hacker or attackers or snooping in on process runtimes!
// All though this won't protect from the Issues such as Network layer attacks in the case of a SSRF please be aware of this!
// In that case you would utilize dockering this blackboxed webserver on a seperate network interface to prevent from those!

// Once i fine polish the pObby.js file again back to what I remeber what I made previously in like 2016 or so then I will copy over to do the same for it here in the aObby.js!
// This will allow creating 3 Layers of rotating obfuscation with a isolated process runs your specified code Obfuscated!!
//Author: Johnathan Edward Brown August 19, 2024
//Made for utility usage for obfuscation from babel and then javascript-obfuscator with timed interval configuration for rotating obfuscation while keeping
//To Obfuscate the obfuscator and rotator class in runetime!
class aObby {
    #TheFile
    #Obbied
    #privateObject
    #serverFile
    #timing
    #importTiming
    #useEnv
    #breakValue
    #timeOut
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
        const fs3 = require('fs');
        const path = require('node:path');
        this.#breakValue = true;
        this.#useEnv = useEnvFile;
        console.log(path.join(__dirname, 'pObby.js'));
        //One time load up to prevent modifications to the original runetime of said obby.js!
        this.#TheFile = fs3.readFileSync(path.join(__dirname, 'pObby.js'), 'utf8');
        this.#Obbied = this.#obfuscateCode(this.#TheFile);
        //console.log('Obfuscated code:', this.#Obbied);
        fs3.writeFileSync(path.join(__dirname, 'pObbiefed.js'), this.#Obbied, 'utf-8');
        const { pObby } = require(path.join(__dirname, 'pObbiefed.js'));
        setTimeout( () => {
            fs3.unlinkSync(path.join(__dirname, 'pObbiefed.js'));
        }, 100);
        //WE now have a private sub class!
        this.#serverFile = serverFile;
        this.#timing = timing;
        this.#importTiming = importTiming;
        this.#privateObject = this.#generatePrivateSubClass(serverFile, timing, importTiming, useEnvFile, pObby);
        this.#timeOut = setTimeout(() => {
            this.#rotateObby();
        }, importTiming);
    }

    #rotateObby(){
        const fs3 = require('fs');
        const path = require('node:path');
        if (this.#breakValue){
            console.log('Rotating Obby import!');
            this.#Obbied = this.#obfuscateCode(this.#TheFile);
            fs3.writeFileSync(path.join(__dirname, 'pObbiefed.js'), this.#Obbied, 'utf-8');
            const { pObby } = require(path.join(__dirname, 'pObbiefed.js'));
            setTimeout( () => {
                fs3.unlinkSync(path.join(__dirname, 'pObbiefed.js'));
            }, 100);
            this.#privateObject.getRun().break();
            this.#privateObject = this.#generatePrivateSubClass(this.#serverFile, this.#timing, this.#importTiming, this.#useEnv, pObby);
            this.#timeOut = setTimeout(() => {
                this.#rotateObby();
            }, this.#importTiming);
        }else{
            return;
        }
    }

    #generatePrivateSubClass(serverFile, timing, importTiming, useEnv, pObby){
        //Private Sub Class
        class PrivateSubClass {
            #run

            constructor(serverFile, timing, importTiming, useEnv, pObby){
                this.#run = new pObby(serverFile, timing, importTiming, useEnv, true);
            }

            getRun(){
                return this.#run;
            }
        }
        return new PrivateSubClass(serverFile, timing, importTiming, useEnv, pObby);
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
          reservedNames: ['process.env', 'process.cwd()', 'pObby'] // Ensure process.env is not obfuscated
        }).getObfuscatedCode();
    }

    /*
    Allows the user to close the parent obfuscator! And child obfuscator utility!
    */
    break(){
        //We set our custom break intercept to false!
        this.#breakValue = false;
        this.#privateObject.getRun().break();
    }
}


module.exports = {
    aObby
}