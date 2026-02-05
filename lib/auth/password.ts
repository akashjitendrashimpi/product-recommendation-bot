import crypto from "crypto"

const SALT_LENGTH = 32
const HASH_ITERATIONS = 100000
const HASH_LENGTH = 64
const DIGEST = "sha512"

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex")

    crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(`${salt}:${derivedKey.toString("hex")}`)
    })
  })
}

// Verify a password against a hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":")

    if (!salt || !key) {
      resolve(false)
      return
    }

    crypto.pbkdf2(
      password,
      salt,
      HASH_ITERATIONS,
      HASH_LENGTH,
      DIGEST,
      (err, derivedKey) => {
        if (err) reject(err)
        else resolve(key === derivedKey.toString("hex"))
      }
    )
  })
}
