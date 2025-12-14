import { Pool, PoolClient } from 'pg';

/**
 * PostgreSQL 연결 풀
 * Java의 DataSource와 동일한 역할
 */
let pool: Pool | null = null;

const getPool = (): Pool => {
    if (!pool) {
        pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20, // 최대 연결 수
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        pool.on('error', (err) => {
            console.error('PostgreSQL pool error:', err);
        });
        console.log('PostgreSQL connection pool created');
    }
    return pool;
};

/**
 * DB 쿼리 실행 (Java의 sqlService.executeQuery_select_for_func와 동일)
 *
 * @param functionName - PostgreSQL 함수명 (예: 'saaswin_sqlgen_select')
 * @param params - 파라미터 객체 (JSONB로 변환됨)
 * @returns Promise<any[]>
 */
export const executeFunction = async (functionName: string, params: Record<string, unknown>): Promise<unknown[]> => {
    const client: PoolClient = await getPool().connect();
    try {
        const query = `SELECT * FROM ${functionName}($1::jsonb)`;
        const values = [JSON.stringify(params)];

        const result = await client.query(query, values);

        console.log(`[DB] ${functionName} - ${result.rows.length} rows`);

        return result.rows;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[DB ERROR] ${functionName}:`, errorMsg);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Raw SQL 실행 (필요시)
 */
export const executeQuery = async (sql: string, params?: unknown[]): Promise<unknown[]> => {
    const client: PoolClient = await getPool().connect();
    try {
        const result = await client.query(sql, params);
        return result.rows;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error('SQL 실행 오류:', errorMsg);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * 트랜잭션 실행 (Java의 @Transactional과 동일)
 */
export const executeTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client: PoolClient = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error('트랜잭션 롤백:', errorMsg);
        throw error;
    } finally {
        client.release();
    }
};
