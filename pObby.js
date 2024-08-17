const fs3 = require('fs');
const path = require('node:path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const newRequire = require;
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

    constructor(serverFile, timing, importTiming, useEnvFile){
        this.#breakValue = true;
        this.#useEnv = useEnvFile;
        console.log(path.join(__dirname, 'Obby.js'));
        //One time load up to prevent modifications to the original runetime of said obby.js!
        this.#TheFile = fs3.readFileSync(path.join(__dirname, 'Obby.js'), 'utf8');
        this.#Obbied = this.#obfuscateCode(this.#TheFile);
        //console.log('Obfuscated code:', this.#Obbied);
        fs3.writeFileSync(path.join(__dirname, 'Obbiefed.js'), this.#Obbied, 'utf-8');
        const { Run } = newRequire(path.join(__dirname, 'Obbiefed.js'));
        fs3.rmSync(path.join(__dirname, 'Obbiefed.js'));
        //WE now have a private sub class!
        this.#serverFile = serverFile;
        this.#timing = timing;
        this.#importTiming = importTiming;
        this.#privateObject = this.#generatePrivateSubClass(serverFile, timing, Run, useEnvFile);
        this.#timeOut = setTimeout(() => {
            this.#rotateObby();
        }, importTiming);
    }

    #rotateObby(){
        if (this.#breakValue){
        this.#privateObject.getRun().break();
        console.log('Rotating Obby import!');
        this.#Obbied = this.#obfuscateCode(this.#TheFile);
        fs3.writeFileSync(path.join(__dirname, 'Obbiefed.js'), this.#Obbied, 'utf-8');
        const { Run } = require(path.join(__dirname, 'Obbiefed.js'));
        fs3.rmSync(path.join(__dirname, 'Obbiefed.js'));
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


module.exports = {
    pObby
}