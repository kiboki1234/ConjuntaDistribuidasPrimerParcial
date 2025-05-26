import { pool } from '../config/database.js';

class BaseModel {
  static get tableName() {
    throw new Error('tableName getter must be overridden');
  }

  static async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  static async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    
    const [result] = await pool.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    await pool.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }
}

export default BaseModel;
