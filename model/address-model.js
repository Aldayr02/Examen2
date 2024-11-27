const db = require('./db');

const AddressModel = {
  getAll: () => {
    return db.query('SELECT * FROM ADDRESSES');
  },
  getById: (id) => {
    return db.query('SELECT * FROM ADDRESSES WHERE id = ?', [id]).then(([rows]) => {
      if (rows.length === 0) {
        return Promise.reject(new Error('Address not found'));
      }
      return rows[0];
    });
  },
  create: (data) => {
    const { client_id, domicilio, colonia, municipio, estado, tipo_direccion } = data;
    return db
      .query(
        'INSERT INTO ADDRESSES (client_id, domicilio, colonia, municipio, estado, tipo_direccion) VALUES (?, ?, ?, ?, ?, ?)',
        [client_id, domicilio, colonia, municipio, estado, tipo_direccion]
      )
      .then(([result]) => {
        return { id: result.insertId, ...data };
      });
  },
  update: (id, data) => {
    const { client_id, domicilio, colonia, municipio, estado, tipo_direccion } = data;
    return db
      .query(
        'UPDATE ADDRESSES SET client_id = ?, domicilio = ?, colonia = ?, municipio = ?, estado = ?, tipo_direccion = ? WHERE id = ?',
        [client_id, domicilio, colonia, municipio, estado, tipo_direccion, id]
      )
      .then(([result]) => {
        if (result.affectedRows === 0) {
          return Promise.reject(new Error('Address not found'));
        }
        return { id, ...data };
      });
  },
  delete: (id) => {
    return db.query('DELETE FROM ADDRESSES WHERE id = ?', [id]).then(([result]) => {
      if (result.affectedRows === 0) {
        return Promise.reject(new Error('Address not found'));
      }
      return { message: 'Address deleted' };
    });
  },
};

module.exports = AddressModel;
