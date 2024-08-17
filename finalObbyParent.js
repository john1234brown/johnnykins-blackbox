const JavaScriptObfuscator = require('javascript-obfuscator');

function obfuscateCode(code) {
  const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
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
    reservedNames: ['process.env'] // Ensure process.env is not obfuscated
  });

  return obfuscationResult.getObfuscatedCode();
}

module.exports = { obfuscateCode };