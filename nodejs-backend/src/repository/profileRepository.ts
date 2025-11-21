import { db, query } from "../db/database";
import mysql, { RowDataPacket } from "mysql2/promise";
import { Invoice, ParentProfile, PaymentMethod } from "../parentProfileBackend";
import {
  convertToDateTimeStringForApp,
  convertToDateTimeStringForDB,
} from "../dbUtils";

export class ProfileRepository {
  async createPaymentMethod(
    paymentMethod: PaymentMethod
  ): Promise<PaymentMethod> {
    const connection = await db.getConnection();
    try {
      // use a transaction to ensure data integrity ie that we do not create a payment method without logging it
      await connection.beginTransaction();
      const sql =
        "INSERT INTO payment_methods (parent_id, method, is_active, creation_date) VALUES (?, ?, ?, ?)";
      const createdAt = convertToDateTimeStringForDB(new Date());
      const [result] = await db.execute<mysql.ResultSetHeader>(sql, [
        paymentMethod.parentId,
        paymentMethod.method,
        paymentMethod.isActive,
        createdAt,
      ]);
      const insertId = result.insertId;

      // Log the creation
      await this.insertIntoAuditLog(
        connection,
        insertId,
        paymentMethod.parentId,
        "CREATE",
        null,
        {
          id: insertId,
          parentId: paymentMethod.parentId,
          method: paymentMethod.method,
          isActive: paymentMethod.isActive,
          createdAt: createdAt || undefined,
        }
      );

      await connection.commit();

      return {
        ...paymentMethod,
        id: insertId,
        createdAt: convertToDateTimeStringForApp(createdAt) || undefined,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async retrievePaymentMethods(parentId: number): Promise<PaymentMethod[]> {
    const sql = "SELECT * FROM payment_methods WHERE parent_id = ?";
    const results = await query(sql, [parentId]);

    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      createdAt: convertToDateTimeStringForApp(r.creation_date) || undefined,
    }));
  }

  async retrieveInvoices(parentId: number): Promise<Invoice[]> {
    const sql = "SELECT * FROM invoices WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      amount: r.amount,
      date: r.date,
    }));
  }

  async retrieveParentProfiles(parentId: number): Promise<ParentProfile[]> {
    const sql = "SELECT * FROM parents WHERE id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      child: r.child,
    }));
  }

  async setActivePaymentMethod(
    parentId: number,
    paymentMethodId: number,
  ): Promise<number> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Fetch old values before update
      const fetchSql = "SELECT * FROM payment_methods WHERE id = ?";
      const [oldMethods] = await connection.execute<RowDataPacket[]>(fetchSql, [
        paymentMethodId,
      ]);

      const sql = "UPDATE payment_methods SET is_active = true WHERE id = ?";
      const [result] = await connection.execute<mysql.ResultSetHeader>(sql, [
        paymentMethodId,
      ]);

      // Log change
      if (oldMethods.length > 0) {
        const oldMethod = oldMethods[0];
        if (!oldMethod.is_active) {
          await this.insertIntoAuditLog(
            connection,
            paymentMethodId,
            parentId,
            "UPDATE",
            {
              isActive: oldMethod.is_active,
            },
            {
              isActive: true,
            }
          );
        }
      }
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deletePaymentMethod(methodId: number): Promise<boolean> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Fetch the payment method before deletion
      const fetchSql = "SELECT * FROM payment_methods WHERE id = ?";
      const [oldMethod] = await connection.execute<RowDataPacket[]>(fetchSql, [
        methodId,
      ]);
      const sql = "DELETE FROM payment_methods WHERE id = ?";
      const [result] = await db.execute<mysql.ResultSetHeader>(sql, [methodId]);

      // Log the deletion
      if (oldMethod.length > 0) {
        await this.insertIntoAuditLog(
          connection,
          methodId,
          oldMethod[0].parent_id,
          "DELETE",
          {
            id: oldMethod[0].id,
            parentId: oldMethod[0].parent_id,
            method: oldMethod[0].method,
            isActive: oldMethod[0].is_active,
            createdAt: oldMethod[0].creation_date,
          },
          {}
        );
      }
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private insertIntoAuditLog(
    connection: mysql.PoolConnection,
    id: number,
    parentId: number,
    changeType: "CREATE" | "UPDATE" | "DELETE",
    stateBeforeChange: Partial<PaymentMethod> | null,
    updatedMethod: Partial<PaymentMethod>
  ) {
    if (!connection) {
      throw new Error(
        "No database connection available for audit log insertion."
      );
    }
    if (!id) {
      throw new Error("No payment method ID provided for audit log insertion.");
    }
    if (!parentId) {
      throw new Error("No parent ID provided for audit log insertion.");
    }

    const auditSql =
      "INSERT INTO payment_method_audit_log (payment_method_id, parent_id, change_type, old_values, new_values) VALUES (?, ?, ?, ?, ?)";

    // Helper function to convert BigInt values to strings for JSON serialization
    const convertBigInts = (_key: string, value: any) => {
      Object.entries(value).forEach(([k, v]) => {
        if (typeof v === "bigint") {
          value[k] = v.toString();
        }
      });
      return value;
    };

    const values = [
      id,
      parentId,
      changeType,
      // what was in the db before the update
      JSON.stringify(stateBeforeChange || {}, convertBigInts),

      // what is being updated to
      JSON.stringify(updatedMethod, convertBigInts),
    ];
    console.log("AUDIT LOG VALUES:", values);
    connection.execute<mysql.ResultSetHeader>(auditSql, values);
  }
}
