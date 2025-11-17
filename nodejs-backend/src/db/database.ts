import mysql, { RowDataPacket } from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.MYSQL_DATABASE || "parent_profile",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  const [rows] = await db.execute<T>(sql, params);
  return rows;
}
