import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  // Default DB renamed to `qrbot` (matches schema.sql instructions)
  database: process.env.DB_NAME || "qrbot",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Get a connection from the pool
export async function getConnection() {
  return getPool().getConnection()
}

// Execute a query
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows as T[]
  } finally {
    connection.release()
  }
}

// Execute a query and return first result
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results.length > 0 ? results[0] : null
}

// Execute an insert/update/delete and return affected rows
export async function execute(
  sql: string,
  params?: any[]
): Promise<{ affectedRows: number; insertId?: number }> {
  const connection = await getConnection()
  try {
    const [result] = await connection.execute(sql, params)
    return result as any
  } finally {
    connection.release()
  }
}

