import { Pool } from 'pg'

// Create PostgreSQL connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
  return pool
}

// Execute a query
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const client = await getPool().connect()
  try {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let paramIndex = 1
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)
    
    const result = await client.query(pgSql, params)
    return result.rows as T[]
  } finally {
    client.release()
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
  const client = await getPool().connect()
  try {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let paramIndex = 1
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)
    
    const result = await client.query(pgSql, params)
    return {
      affectedRows: result.rowCount || 0,
      insertId: result.rows[0]?.id
    }
  } finally {
    client.release()
  }
}