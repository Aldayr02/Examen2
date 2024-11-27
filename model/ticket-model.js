const db = require('./db');
const ProductModel = require('./product-model');

const NotaVentaModel = {
  createTicket: async (data) => {
    const { clientId, direccionFacturacionId, direccionEnvioId, contenido } = data;
    if (
      !clientId ||
      !direccionFacturacionId ||
      !direccionEnvioId ||
      !contenido ||
      contenido.length === 0
    ) {
      throw new Error('Datos requeridos faltantes - CREATETICKET');
    }

    try {
      const productos = await Promise.all(
        contenido.map(async (item) => {
          const product = await ProductModel.getById(item.productId);

          console.log(product.precio_base);

          if (product && product.precio_base !== undefined) {
            const importe = (product.precio_base * item.cantidad).toFixed(2);
            return {
              product_id: product.id,
              cantidad: item.cantidad,
              precio_unitario: product.precio_base,
              importe,
            };
          } else {
            throw new Error(`Precio no disponible para el producto ID: ${item.productId}`);
          }
        })
      );

      const total = productos.reduce((sum, item) => sum + parseFloat(item.importe), 0).toFixed(2);

      const [result] = await db.query(
        'INSERT INTO NOTAS_VENTA (client_id, direccion_facturacion_id, direccion_envio_id, total) VALUES (?, ?, ?, ?)',
        [clientId, direccionFacturacionId, direccionEnvioId, total]
      );

      await Promise.all(
        productos.map(async (producto) => {
          await NotaVentaModel.createContenido({
            notaVentaId: result.insertId,
            productId: producto.product_id,
            cantidad: producto.cantidad,
            precioUnitario: producto.precio_unitario,
          });
        })
      );

      return {
        id: result.insertId,
        clientId,
        direccionFacturacionId,
        direccionEnvioId,
        total,
        contenido: productos,
      };
    } catch (error) {
      console.error('Error al crear la nota de venta:', error.message);
      throw new Error('Error al crear la nota de venta');
    }
  },

  getTicketById: async (id) => {
    try {
      const [notaVentaRows] = await db.query('SELECT * FROM NOTAS_VENTA WHERE id = ?', [id]);

      if (notaVentaRows.length === 0) {
        throw new Error('Nota de venta no encontrada');
      }

      const [contenidoRows] = await db.query(
        'SELECT * FROM CONTENIDO_NOTA_VENTA WHERE nota_venta_id = ?',
        [id]
      );

      return {
        ...notaVentaRows[0],
        contenido: contenidoRows,
      };
    } catch (error) {
      console.error('Error al obtener la nota de venta:', error.message);
      throw new Error('Error al obtener la nota de venta');
    }
  },

  createContenido: async (data) => {
    const { notaVentaId, productId, cantidad, precioUnitario } = data;

    console.log('Datos recibidos para crear contenido:', data);

    const importe = (precioUnitario * cantidad).toFixed(2);

    if (!notaVentaId || !productId || !cantidad || precioUnitario === undefined) {
      throw new Error('Datos requeridos faltantes - CREATECONTENIDO');
    }

    try {
      const [result] = await db.query(
        'INSERT INTO CONTENIDO_NOTA_VENTA (nota_venta_id, product_id, cantidad, precio_unitario, importe) VALUES (?, ?, ?, ?, ?)',
        [notaVentaId, productId, cantidad, precioUnitario, importe]
      );

      return { id: result.insertId, ...data, importe };
    } catch (error) {
      console.error('Error al crear el contenido de la nota de venta:', error.message);
      throw new Error('Error al crear el contenido de la nota de venta');
    }
  },

  getContenidoById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM CONTENIDO_NOTA_VENTA WHERE id = ?', [id]);

      if (rows.length === 0) {
        throw new Error('Contenido de nota de venta no encontrado');
      }

      return rows[0];
    } catch (error) {
      console.error('Error al obtener contenido de nota de venta:', error.message);
      throw new Error('Error al obtener contenido de nota de venta');
    }
  },
};

module.exports = NotaVentaModel;
