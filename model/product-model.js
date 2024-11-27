const db = require('./db');

const ProductModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM PRODUCTS');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM PRODUCTS WHERE id = ?', [id]);
    // console.log(rows);
    if (rows.length === 0) {
      throw new Error('Product not found');
    }
    console.log(rows[0]);
    return rows[0];
  },

  create: async (data) => {
    const { nombre, unidad_medida, precio_base } = data;
    const [result] = await db.query(
      'INSERT INTO PRODUCTS (nombre, unidad_medida, precio_base) VALUES (?, ?, ?)',
      [nombre, unidad_medida, precio_base]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const { nombre, unidad_medida, precio_base } = data;
    const [result] = await db.query(
      'UPDATE PRODUCTS SET nombre = ?, unidad_medida = ?, precio_base = ? WHERE id = ?',
      [nombre, unidad_medida, precio_base, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Product not found');
    }
    return { id, ...data };
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM PRODUCTS WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Product not found');
    }
    return { message: 'Product deleted' };
  },
};

module.exports = ProductModel;
