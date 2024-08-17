const crypto = require('crypto');
const session = require('express-session');

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
/*      try {
        if (typeof encryptedData === 'string') {
          const sessionData = this.decrypt(encryptedData);
          const session = JSON.parse(sessionData);
//          console.log('Touch intercept: ', JSON.stringify(session, null, 2));
          return super.set(sid, session, callback);
        } else {
          return callback(null);
        }
      } catch (error) {
        console.log('Error:', error);
        return super.set(sid, encryptedData, callback);
      }*/
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

module.exports = { EncryptedMemoryStore };
