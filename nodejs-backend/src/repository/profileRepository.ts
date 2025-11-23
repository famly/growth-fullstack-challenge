import { db, query } from "../db/database";
import mysql from "mysql2/promise";
import { Invoice, ParentProfile, PaymentMethod, PaymentMethodHistory } from "../parentProfileBackend";

export class ProfileRepository {
  // Helper to generate a random user ID (for demonstration purposes)
  private getRandomUserId(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }

  // Helper to record payment method history
  private async recordHistory(paymentMethod: PaymentMethod): Promise<void> {
    const sql = `INSERT INTO payment_method_history 
      (payment_method_id, parent_id, method, is_active, changed_by_user_id) 
      VALUES (?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      paymentMethod.id,
      paymentMethod.parentId,
      paymentMethod.method,
      paymentMethod.isActive,
      this.getRandomUserId(),
    ]);
  }
  async createPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    const sql = "INSERT INTO payment_methods (parent_id, method, is_active) VALUES (?, ?, ?)";
    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [
      paymentMethod.parentId,
      paymentMethod.method,
      paymentMethod.isActive,
    ]);
    const insertId = result.insertId;
    
    // Fetch the created payment method to get the created_at timestamp
    const createdMethod = await this.getPaymentMethodById(insertId);
    
    // Record history for creation
    if (createdMethod) {
      await this.recordHistory(createdMethod);
    }
    
    return createdMethod || { ...paymentMethod, id: insertId, createdAt: '' };
  }

  private async getPaymentMethodById(id: number): Promise<PaymentMethod | null> {
    const sql = "SELECT * FROM payment_methods WHERE id = ?";
    const results = await query(sql, [id]);
    if (results.length === 0) return null;
    const r = results[0];
    return {
      id: r.id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    };
  }

  async retrievePaymentMethods(parentId: number): Promise<PaymentMethod[]> {
    const sql = "SELECT * FROM payment_methods WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    }));
  }

  async retrieveInvoices(parentId: number): Promise<Invoice[]> {
    const sql = "SELECT * FROM invoices WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      amount: r.amount,
      date: r.date.toLocaleString(),
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

  async updatePaymentMethods(updatedPaymentMethods: PaymentMethod[]): Promise<number[]> {
    const updatePromises = updatedPaymentMethods.map(async (paymentMethod) => {
      const sql = "UPDATE payment_methods SET parent_id = ?, method = ?, is_active = ? WHERE id = ?";
      const [result] = await db.execute<mysql.ResultSetHeader>(sql, [
        paymentMethod.parentId,
        paymentMethod.method,
        paymentMethod.isActive,
        paymentMethod.id,
      ]);
      
      // Get the updated payment method and record history
      const updatedMethod = await this.getPaymentMethodById(paymentMethod.id);
      if (updatedMethod) {
        await this.recordHistory(updatedMethod);
      }
      
      return result;
    });
    const results = await Promise.all(updatePromises);
    return results.map((result: mysql.ResultSetHeader) => result.affectedRows);
  }

  async deletePaymentMethod(methodId: number): Promise<boolean> {
    // Get the payment method before deleting to record history
    const method = await this.getPaymentMethodById(methodId);
    
    if (method) {
      // Record history before deletion
      await this.recordHistory(method);
    }
    
    const sql = "DELETE FROM payment_methods WHERE id = ?";
    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [methodId]);
    return result.affectedRows > 0;
  }

  async retrievePaymentMethodHistory(paymentMethodId: number): Promise<PaymentMethodHistory[]> {
    const sql = "SELECT * FROM payment_method_history WHERE payment_method_id = ? ORDER BY changed_at DESC";
    const results = await query(sql, [paymentMethodId]);
    return results.map((r) => ({
      id: r.id,
      paymentMethodId: r.payment_method_id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      changedAt: r.changed_at instanceof Date ? r.changed_at.toISOString() : r.changed_at,
      changedByUserId: r.changed_by_user_id,
    }));
  }
}
