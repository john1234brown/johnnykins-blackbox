# Johnnykins - Blackbox

- Do you find yourself needing to obfuscate a webserver in rotated manner and just find yourself not having the time to make a babel transformer class for your server file!
- Well don't worry we are here to help solve this problem in todays world!
- With this nice blackbox design we have simple Obby class which you can create a new Obby object and specify the file you want to obfuscate and what interval rate you want it to reobfuscate in runetime!
- Go and Build out your obfuscated dreams!!!!! In more secure peace of mind manner!
- Also it supports process.env obfuscation with translations! So if you need to use dotenv file we got you covered :D! All Though this Wouldn't be the Ideal method for holding Secrets! In Production Server So Please be advised.... You've Been warned!

## Example Server Code

```js
//Author: Johnathan Edward Brown August 16, 2024
//With Some Help From: Vampeyer
//Along With Some Help From: AI Models Such As Gemini, And ChatGPT 4.0 mini and ChatGPT-4.0
//This includes a fail safe key rotation method just incase server is up past the obfsucated runtime rotation somehow and helps protect the encrypted data as a final layer of security!
//Which would be proper security practices but sadly we see this is not the case! So hence why I am releasing this! To increase Security Standards and layers
//By always preparing for the worst events we ensure less risk!
//One of the worst events is Obfuscated code rotation is intercepted and paused or slowed down if so we keep a failsafe design principle to keep rotating keys responsible for encrypted data in runetime!
//Another one would be Keys being leaked and due to the rotation and flush design it simplifies not needing to reencrypt sessions!
//WE Limit to 5 minutes to allow 5 minute window of accessiblity from the website entry point!
//I hope these notes are helpful to help users create more secure Auth0 Servers and services in the future!
//Please check out our Nakamotos-Blackbox For protecting express static servers from XSS, SSRF, path Traversals!
//Must use GLOBAL_STRING FOR THIS UTILITY FILE TO WORK!!!
process.stdout.on(GLOBAL.getGlobalString(), ()=>{
  app.removeAllListeners();
  clearInterval(i1);
  listen.closeAllConnections();
  listen.close();
  setTimeout(() =>{
  }, 1000);
});
//require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const session = require('express-session');
const crypto = require('node:crypto');
const { jose, jwtVerify, importJWK } = require('jose'); //Who is jose you may ask well jose is a nice JWT Key Utility tool in npm!
const path = require('node:path');
//Author: Johnathan Edward Brown
class EncryptedMemoryStore extends session.MemoryStore {
  #encryptionKey;
  #iv;
  #salt;
  #oldKey;
  #oldIv;
//  #tempStore;

  constructor(options = {}) {
    super(options);
    this.#encryptionKey = crypto.randomBytes(32); // AES-256 key
    this.#iv = crypto.randomBytes(16); // AES block size for GCM
    this.#salt = crypto.randomBytes(16).toString('hex'); // Salt for hashing
    //this.#tempStore = new session.MemoryStore(); // Temporary store for migrated sessions
  }

  // Encryption function
  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-gcm', this.#encryptionKey, this.#iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${encrypted}:${tag}`;
  }

  // Decryption function
  decrypt(encryptedText) {
    try {
      if (!encryptedText) return;
      const [encrypted, tag] = encryptedText.split(':');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.#encryptionKey, this.#iv);
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      return err;
    }
  }

  // Hashing function for id_token
  hashIdToken(idToken) {
    const hash = crypto.createHmac('sha256', this.#salt)
      .update(idToken)
      .digest('hex');
    return hash;
  }

  // Verification function for id_token
  verifyIdToken(idToken, storedHash) {
    const hash = this.hashIdToken(idToken);
    return hash === storedHash;
  }

  // Overriding the set method
  set(sid, session, callback) {
    try {
      if (typeof session !== 'object' || !session || !sid) {
        throw new TypeError('Session data must be an object');
      }

      // Hash the id_token if it exists
      if (session.data && session.data.id_token) {
        session.data.id_token_hash = this.hashIdToken(session.data.id_token);
        //delete session.data.id_token; // Remove the original id_token
      }

      const sessionData = JSON.stringify(session);
      const encryptedData = this.encrypt(sessionData);
      return super.set(sid, encryptedData, callback);
    } catch (error) {
      console.log('Error:', error);
      return callback(error);

    }
  }

  // Overriding the get method
  get(sid, callback) {
    super.get(sid, (err, encryptedData) => {
      if (err) return callback(err);
      if (!encryptedData) return callback(null, null);

      try {
        const sessionData = this.decrypt(encryptedData);

        if (typeof sessionData === 'object' || typeof sessionData === 'string' && sessionData) {
          const session = JSON.parse(sessionData);
   //     console.log('session id:', sid, 'Session retrieved:', session);
          return callback(null, session);
        }
      } catch (error) {
        console.log('Error:', error);
        return callback(null, encryptedData);
      }
    });
  }

  // Overriding the touch method
  touch(sid, session, callback) {
    this.get(sid, (err, encryptedData) => {
      if (err) return callback(err);
      if (!encryptedData) return callback(null);
      return this.set(sid, encryptedData, callback);
    });
  }

  pureKeyRotate(){
//    this.removeAllListeners();
    //Lock out prying eyes! >.> // sometimes simpler is easier!
    this.setMaxListeners(2);// ^.^ // <.<
    this.clear();
    this.#encryptionKey = crypto.randomBytes(32); // AES-256 key
    this.#iv = crypto.randomBytes(16); // AES block size for GCM
    this.#salt = crypto.randomBytes(16).toString('hex'); // Salt for hashing
  }
}

let lastRequestTime = {};

// Function to generate a new random secret
function generateSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Set the initial secret
//This is to make them think the secrets in process environment It actually really bad practice to securely store something of context which holds such importances in the environment runetime of NodeJS
//Due to the memory address exploit issues!
process.env.SECRET = generateSecret();
const rotationInterval = 60000; // Interval to rotate secrets (in milliseconds)
//See here we utilize a Class constructor which holds private field this is memory safe storage in NodeJS runetime to securely hold something of reference in memory runetime!
//We also would obfuscate this said entire projects source code as well in production mode is the proper security practice and design principles for auth0 servers and services!
//When you just plan crazy and insane but it works! 50/100 developers would agree! If not 50/50 Developers would agree!
class Test {

    #privateField
    #password
    #secret
    
    constructor(){
  //     const sessionStore = new MemoryStore({
  //          checkPeriod: 60000, // prune expired entries every 1 minutes!
  //      });
  //      sessionStore.setMaxListeners(1);
  //      const sqliteSessionStore = new SQLiteSessionStore('session.db');
  //      sqliteSessionStore.setMaxListeners(1);
  //      this.#privateField = sqliteSessionStore;
  //      this.#privateField = sessionStore;
        //no Need to use prune we have our own built in flushing system and key rotations every 5 minutes!
        const sessionStore2 = new EncryptedMemoryStore();
        this.#privateField = sessionStore2;
        this.#secret = generateSecret();
    }
  
    getPrivate(){
        return this.#privateField;
    }
  
    getSecret(){
      return this.#secret
    }
  
    setSecret(){
      this.#secret = generateSecret();
    }
  
    flushRotate(){
        console.log('Flush rotate called within counter limit! Rotating Flushing and Rencrypting!');
        //We flush and rotate and reset counter!
        this.#privateField.pureKeyRotate();
    }
}
const sessionStore = new Test();
//Prevent snooping on session storage!
// Utility function to remove all listeners from the session store
const app = express();
// Middleware Session configuration
function configureSessionMiddleware(secret) {
    sessionStore.setSecret();
    app.use(session({
      secret: sessionStore.getSecret(),
      resave: true, // Leave false later on!
      saveUninitialized: false,
      store: sessionStore.getPrivate(),
      cookie: { maxAge: rotationInterval }, // every 1 minutes
      rolling: false
    }));
}
// Apply initial session middleware
configureSessionMiddleware(process.env.SECRET);
// Function to update the session secret
function updateSessionSecret() {
  const sessionSecret = generateSecret();
  // Reconfigure the session middleware with the new secret
  configureSessionMiddleware(sessionSecret);
}

// Function to update the session secret
function updateSessionKeys() {
  sessionStore.flushRotate();
}
// Example of periodic secret update
const i1 = setInterval(updateSessionKeys, 300000); // Every 5 minute was 5 minutes

// Helper function to validate inputs using regex
function validateInput(input, regex) {
    return regex.test(input);
}

// Helper function to sanitize input by escaping special characters
function sanitizeInput(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

function verifyAuth0Session(req, res, next) {
  try {
    const userSub = req.oidc.user.sub; // The user's unique identifier (sub)
    const userSid = req.oidc.user.sid; // The user's session ID (sid)
    const sessionId = req.sessionID;

    // Define regex patterns for validation
    const subRegex = /^[a-zA-Z0-9-_|]+$/; // Example pattern: alphanumeric, dashes, underscores
    const sidRegex = /^[a-zA-Z0-9-_]+$/; // Example pattern: alphanumeric, dashes, underscores
    const sessionIdRegex = /^[a-zA-Z0-9-_]+$/; // Example pattern: alphanumeric, dashes, underscores

    // Validate `sub`, `sid`, and `sessionId` using regex
    if (!validateInput(userSub, subRegex) || !validateInput(userSid, sidRegex) || !validateInput(sessionId, sessionIdRegex)) {
      console.error('Invalid input detected');
      return res.status(401).send('Unauthorized: Invalid session information');
    }

    // Sanitize inputs (additional security, but not necessary if validation is strict)
    const sanitizedSub = sanitizeInput(userSub);
    const sanitizedSid = sanitizeInput(userSid);
    const sanitizedSessionId = sanitizeInput(sessionId);

    // Check if the session exists in memory store
    sessionStore.getPrivate().get(sanitizedSessionId, (err, session) => {
      if (err) {
        console.error('Error accessing session store:', err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (!session) {
        return res.status(401).send('Unauthorized: Session not found');
      }
  
      // Verify the stored session's `sub` and `sid` against the ones from Auth0
      if (session.oidc && session.oidc.user && session.oidc.user.sub === userSub && session.oidc.user.sid === userSid) {
        console.log(`Double-verification successful for sub: ${sanitizedSub} with sid: ${sanitizedSid}`);
        next();
      } else {
        return res.status(401).send('Unauthorized: Session mismatch');
      }
    });

  } catch (error) {
    console.error('Error verifying Auth0 session:', error);
    return res.status(500).send('Internal Server Error');

  }
}

const config = {
  authRequired: false,
  auth0Logout: true, // Enable Auth0's automatic logout
  idpLogout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  session: {
    store: sessionStore.getPrivate(), // Attach your session store
  }
};
app.use(auth(config));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), './public')));

let sessionLastActivity = {};
const SESSION_TIMEOUT = 15; // 5 minutes in milliseconds

// Middleware to store sub and sid in session
app.use(async (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    //This will prevent sniffing and snooping of idTokens since we dont using JWT!
    const userSub = req.oidc.user.sub;
    const userSid = req.oidc.user.sid;

    console.log('Authenticated user:', userSub, userSid);

    // Ensure the session object has oidc data
    if (!req.session.oidc) {
      req.session.oidc = {};
    }

    // Store sub and sid in the session
    req.session.oidc.user = {
      sub: userSub,
      sid: userSid
    };
    req.session.email = req.oidc.user.email;
    // Middleware to check session timeout
    const sessionId = req.sessionID;
    if (sessionId && sessionLastActivity[sessionId]) {
      const lastActivity = sessionLastActivity[sessionId];
      const currentTime = Date.now();
      if (parseInt((currentTime/1000)-(lastActivity/1000)) > SESSION_TIMEOUT) {
        req.sessionTimedOut = true;
      }else{//Reset the time only if not in range!
        const lastActivity = Date.now();
        sessionLastActivity[sessionId] = lastActivity;
        req.sessionTimedOut = false;
      }
    }else if (sessionId && !sessionLastActivity[sessionId]){ //Set the time!
      //enforceSessionTimeout(req, res, next); //Remove here!
      const lastActivity = Date.now();
      sessionLastActivity[sessionId] = lastActivity;
      req.sessionTimedOut = false;
    }

    // Save the session to memoryStore
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Internal Server Error');
      }
      //Enforce here!
      enforceSessionTimeout(req, res, next);
      next();
    });
  } else {
    next();
  }
});


app.get('/check-session-status', requiresAuth(), (req, res) => {
  if (req.sessionTimedOut) {
    res.json({ sessionTimedOut: true });
  } else {
    res.json({ sessionTimedOut: false });
  }
});

// Utility function to delete user sessions from MemoryStore
// And also log user out of Auth0 App Network!
function deleteUserSessions(sessionStore, userId, sessionId) {
  sessionStore.destroy(sessionId, async (err) => {
    if (err) {
      console.error('Failed to destroy session:', err);
    } else {
      console.log(`Session ${sessionId} for user ${userId} destroyed`);
    
      // Clean up the last request time entry to prevent memory leaks
      delete lastRequestTime[sessionId];
    
      delete sessionLastActivity[sessionId]
      // Attempt to log out the user from Auth0 via a server-side request
      try {
        const response = await fetch(`https://dev-vh2t60m5403ism26.us.auth0.com/oidc/logout?logout_hint=${userId}&client_id=${process.env.AUTH0_CLIENT_ID}&federated=true`, {
          method: 'GET',
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          }
        });
    
        if (!response.ok) {
          throw new Error(`Failed to log out user from Auth0. Status: ${response.status}`);
        }
    
        if (response.status === 200){
          console.log('Success!!!', response.status);
        }
    
        console.log(`User ${userId} successfully logged out from Auth0 response:`);
      } catch (error) {
        console.error('Error during Auth0 logout request:', error.message);
        // Optionally handle the error (e.g., retry logic or notifying the admin)
      }
      // Redirect to Auth0 logout endpoint
      //// res.redirect(`https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(process.env.BASE_URL)}`);
    }
  });
}


function getJWKS() {
  return new Promise((resolve, reject) => {
    fetch('https://dev-vh2t60m5403ism26.us.auth0.com/.well-known/jwks.json')
      .then(response => {
        if (!response.ok) {
          return reject(new Error('Failed to fetch JWKS'));
        }
        return response.text();
      })
      .then(text => {
        try {
          const json = JSON.parse(text);
          // Optionally log the JSON response
          //console.log('Response received:', JSON.stringify(json, null, 2));
          resolve(json); // Resolve the promise with the parsed JSON
        } catch (error) {
          reject(new Error('Failed to parse JWKS JSON'));
        }
      })
      .catch(error => {
        console.error('Error getting JWKS:', error);
        reject(error); // Reject the promise with the fetch or network error
      });
  });
}

async function getKey(header, jwks) {
  const key = jwks.keys.find(k => k.kid === header.kid);
  if (!key) {
    throw new Error('No Keys Found');
  }

  //console.log('JWK Key:', key);

  try {
    const keyObject = await importJWK(key, "RS256");
    //console.log('KeyObject:', keyObject);
    return keyObject;
  } catch (err) {
    console.error('Error importing JWK:', err);
    throw new Error('Failed to import JWK');
  }
}


async function verifyLogoutToken(token) {
  //console.log('Verifying token:', token);
  const JWKS = await getJWKS();
  //console.log('Verify test:', JWKS);
  try {
    const { payload } = await jwtVerify(token, async (header) => {
      const key = await getKey(header, JWKS);
      return key;
    }, {
      issuer: "https://dev-vh2t60m5403ism26.us.auth0.com/",
      audience: process.env.AUTH0_CLIENT_ID
    });

    //console.log('Payload retrieved:', payload);

    return payload; 
  } catch (err) {
    console.error('Invalid logout token:', err);
    throw new Error('Invalid logout token');
  }
}

app.post('/backchannel-logout', async (req, res) => {
  req.toArray().catch(error =>{
    console.log(error);
  }).then( async (value) =>{
    const string = new String(value.toLocaleString());
    if (string.includes('logout_token=')){
      console.log('Backchannel-logout called with request:');
      const logoutToken = string.replace('logout_token=', '');
      try {
        const payload = await verifyLogoutToken(logoutToken);
        console.log('Logout token verified:');/*, //payload);*/
    
        const { sub, sid } = payload;
        if (sub && sid) {
          deleteUserSessions(sessionStore.getPrivate(), sid, req.sessionID);
          res.sendStatus(200);
        } else {
          res.status(400).send('Missing sub or sid in logout token');
        }
      } catch (error) {
        res.status(400).send('Invalid logout token');
      }
    }
  });
});

function enforceSessionTimeout(req, res, next) {
    if (req.session && req.oidc.user) {
      if (!req.oidc.user.sid) {
        return next();
      }
  
      console.log('Enforcing Session ID! Removal!');
      const sessionId = req.sessionID;
  
      // Track the last request time for the session
      lastRequestTime[sessionId] = Date.now();
  
      // Handle the session timeout asynchronously
      setTimeout(() => {
        try {
          const currentTime = Date.now();
          const timeSinceLastRequest = currentTime - lastRequestTime[sessionId];
        
          // If it's been more than 5 minutes since the last request, force logout
          if (timeSinceLastRequest >= 30000) { // 5 minutes
            console.log('Login Route intercepted and deleting session!');
            deleteUserSessions(sessionStore.getPrivate(), req.oidc.user.sid, sessionId);
          }
        } catch (error) {
          //reject(error);
        }
      }, rotationInterval); // 5 minutes
  
      // Resolve immediately to continue the middleware chain
      return next();
  
    } else {
      // Resolve immediately if no session or user
      return next();
    }
}


async function respondSubmit(res){
  return new Promise((resolve) =>{
    resolve(res.sendStatus(200));
  });
}

app.post('/submit-form', requiresAuth(), verifyAuth0Session, (req, res) => {
  const data = req.body.data;
  console.log('Form submitted with data:', data);
  res.sendStatus(200);
//  res.sendStatus(200);//({ data: data }); // Correctly format response as JSON
  //await respondSubmit(res);
});

app.get('/profile', requiresAuth(), (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const idToken = req.oidc.idToken; // Retrieve ID token
    req.session.idToken = idToken;
  }
  // Send the user's profile as the response
  return res.send(JSON.stringify({ data: req.oidc.user, idToken: req.session.idToken}));
});

var listen = app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
```

## How to Use

- This will allow you to utilize process.env variables from a dotenv file from the top level process!
- This will allow you to specifiy what interval you want to obfuscate said code in runetime in a encapsulated class!
- I really hope you enjoy this very useful security utility tool for securing your webservers!
- Also enjoy the free Secure Auth0 Template design above!
- To a more secure and better future for webservers!!! Hip Hip Hooray!!!
- Go and Build your hearts outs and don't forget to give me credit where credit is due.

```js
require('dotenv').config();
const { Obby } = require('johnnykins-blackbox');

//Test it out lets goo!
const Obbyy = new Obby('./index.js', 15000);
```

### Credits

- A Big Thanks to <https://github.com/vampeyer> for all the security principles and practices which you have been slowly teaching me all these different design patterns and principles which has helped me today be able to release a really useful utility tool for the public world as I believe it does get tedious setting up a babel transformer for every webserver today so to simplify this process we have worked hard on coming up with a simple utility for the world to enjoy So be sure to go and give him support for all he develops and does!

### Ai Models used

- Big shout out to ChatGPT 4.0 for the usages of helping understand babel transformer from my knowledge of java class transforming in the minecraft mod community!
- Gemini as well for some nice snippets to help me aid in making this utility.
