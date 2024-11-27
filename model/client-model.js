const db = require('./db');

const ClientModel = {
  getALL: () => {
    return db.query('SELECT * FROM CLIENTS');
  },
  getById: (id) => {
    // console.log('getById');
    return db.query('SELECT * FROM CLIENTS WHERE id = ?', [id]).then(([rows]) => {
      if (rows.length === 0) {
        return Promise.reject(new Error('Client not found'));
      }
      return rows[0];
    });
  },
  create: (data) => {
    const { razon_social, nombre_comercial, email } = data;
    return db
      .query('INSERT INTO CLIENTS (razon_social, nombre_comercial, email) VALUES (?, ?, ?)', [
        razon_social,
        nombre_comercial,
        email,
      ])
      .then(([result]) => {
        return { id: result.insertId, ...data };
      });
  },
  update: (id, data) => {
    const { razon_social, nombre_comercial, email } = data;
    return db
      .query('UPDATE CLIENTS SET razon_social = ?, nombre_comercial = ?, email = ? WHERE id = ?', [
        razon_social,
        nombre_comercial,
        email,
        id,
      ])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          return Promise.reject(new Error('Client not found'));
        }
        return { id, ...data };
      });
  },
  delete: (id) => {
    return db.query('DELETE FROM CLIENTS WHERE id = ?', [id]).then(([result]) => {
      if (result.affectedRows === 0) {
        return Promise.reject(new Error('ClienT not found'));
      }
      return { message: 'Client deleted' };
    });
  },
};

module.exports = ClientModel;
