const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'examen2.czrvbuevjmwe.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'admin123',
  database: 'Examen',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createTables = async () => {
  const ClientsTable = `
  CREATE TABLE IF NOT EXISTS CLIENTS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  );`;

  const AddressesTable = `
  CREATE TABLE IF NOT EXISTS ADDRESSES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    domicilio VARCHAR(255) NOT NULL,
    colonia VARCHAR(255) NOT NULL,
    municipio VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    tipo_direccion ENUM('FACTURACIÓN', 'ENVÍO') NOT NULL,
    FOREIGN KEY (client_id) REFERENCES CLIENTS(id)
  );`;

  const ProductsTable = `
  CREATE TABLE IF NOT EXISTS PRODUCTS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    precio_base DECIMAL(10, 2) NOT NULL
  );`;

  const NotasDeVentaTable = `
  CREATE TABLE IF NOT EXISTS NOTAS_VENTA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    direccion_facturacion_id INT NOT NULL,
    direccion_envio_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES CLIENTS(id),
    FOREIGN KEY (direccion_facturacion_id) REFERENCES ADDRESSES(id),
    FOREIGN KEY (direccion_envio_id) REFERENCES ADDRESSES(id)
  );`;

  const ContenidoDeNotaTable = `
  CREATE TABLE IF NOT EXISTS CONTENIDO_NOTA_VENTA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nota_venta_id INT NOT NULL,
    product_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    importe DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (nota_venta_id) REFERENCES NOTAS_VENTA(id),
    FOREIGN KEY (product_id) REFERENCES PRODUCTS(id)
  );`;

  let connection;
  try {
    connection = await pool.getConnection();

    // Crear las tablas
    await connection.query(ClientsTable);
    console.log('Table CLIENTS created or already exists');

    await connection.query(AddressesTable);
    console.log('Table ADDRESSES created or already exists');

    await connection.query(ProductsTable);
    console.log('Table PRODUCTS created or already exists');

    await connection.query(NotasDeVentaTable);
    console.log('Table NOTAS_VENTA created or already exists');

    await connection.query(ContenidoDeNotaTable);
    console.log('Table CONTENIDO_NOTA_VENTA created or already exists');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    if (connection) connection.release();
  }
};

createTables();

module.exports = pool;
