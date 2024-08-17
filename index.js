//Author: Johnathan Edward Brown
//With Some Help From: Vampeyer
//Along With Some Help From: AI Models Such As Gemini, And ChatGPT 4.0 mini and ChatGPT-4.0
//require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const session = require('express-session');
const crypto = require('node:crypto');
const MemoryStore = require('memorystore')(session); // Using MemoryStore as an example, replace it with your session store if needed
const { jose, jwtVerify, importJWK } = require('jose'); //Who is jose you may ask well jose is a nice JWT Key Utility tool in npm!
//const { SQLiteSessionStore } = require('./util.js');
const { EncryptedMemoryStore } = require('./util3.js');
eventEmitter.on(Special_Global_String, ()=>{
  app.removeAllListeners();
  clearInterval(i1);
  clearInterval(i2);
  listen.closeAllConnections();
  listen.close();
  setTimeout(() =>{
  }, 1000);
})

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
    //console.log('Session triggered!');
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

// Example of periodic secret update
//setInterval(updateSessionSecret, 300000); // Every 5 minutes


// Function to update the session secret
function updateSessionKeys() {
  sessionStore.flushRotate();
}
// Example of periodic secret update
const i1 = setInterval(updateSessionKeys, 300000); // Every 5 minute was 5 minutes

function test(){
  sessionStore.getPrivate().all((err, session) =>{
    if (err) return;
    console.log('Session Object:', session);
  })
}

const i2 = setInterval(test, 10000); // Every 5 minute was 5 minutes

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
//app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true, store: sessionStore, cookie: { maxAge: 30000 }, rolling: true }));
app.use(express.static('./public'));

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




