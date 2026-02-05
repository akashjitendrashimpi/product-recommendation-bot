// Script to generate a password hash for test users
// Run with: node scripts/generate_password_hash.js

const crypto = require('crypto');

const SALT_LENGTH = 32;
const HASH_ITERATIONS = 100000;
const HASH_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

// Test the hash
async function testHash() {
  const password = 'test123';
  const hash = await hashPassword(password);
  
  console.log('Generated hash for password "test123":');
  console.log(hash);
  console.log('\nHash length:', hash.length);
  console.log('\nUse this hash in your SQL file for all test users.');
  console.log('\nTo verify, you can test it with:');
  console.log('const crypto = require("crypto");');
  console.log('const [salt, key] = "' + hash + '".split(":");');
  console.log('crypto.pbkdf2("test123", salt, 100000, 64, "sha512", (err, derived) => {');
  console.log('  console.log("Match:", key === derived.toString("hex"));');
  console.log('});');
}

testHash().catch(console.error);
