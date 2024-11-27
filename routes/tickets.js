const router = require('express').Router();
const TicketModel = require('../model/ticket-model');
const { generatePDF, notifyClient, s3, bucketName } = require('../utils/nota-functions');

const url = '3.84.157.106:3000';

router.post('/venta', async (req, res) => {
  try {
    const { clientId, direccionFacturacionId, direccionEnvioId, contenido } = req.body;

    if (
      !clientId ||
      !direccionFacturacionId ||
      !direccionEnvioId ||
      !contenido ||
      contenido.length === 0
    ) {
      return res.status(400).json({ message: 'Faltan datos requeridos. POST VENTA' });
    }

    const notaVenta = await TicketModel.createTicket({
      clientId,
      direccionFacturacionId,
      direccionEnvioId,
      contenido,
    });

    if (!notaVenta) {
      return res.status(500).json({ message: 'Error creando la nota de venta' });
    }

    try {
      await generatePDF(notaVenta.id);
    } catch (error) {
      console.error('Error generando el PDF:', error.message);
      return res.status(500).json({ message: 'Error generando el PDF' });
    }

    const downloadUrl = `http://${url}/tickets/${notaVenta.id}`;

    await notifyClient(downloadUrl);

    res.status(201).json({ message: 'Nota de venta creada', downloadUrl });
  } catch (error) {
    console.error('Error creando nota de venta:', error.message);
    res.status(500).json({ message: 'Error creando nota de venta' });
  }
});

router.post('/contenido', async (req, res) => {
  try {
    const { notaVentaId, productId, cantidad, precioUnitario, importe } = req.body;

    if (
      !notaVentaId ||
      !productId ||
      !cantidad ||
      precioUnitario === undefined ||
      importe === undefined
    ) {
      return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    const contenidoNota = await TicketModel.createContenido({
      notaVentaId,
      productId,
      cantidad,
      precioUnitario,
      importe,
    });

    res.status(201).json({ message: 'Contenido de nota de venta creado', contenidoNota });
  } catch (error) {
    console.error('Error creando contenido de nota de venta:', error.message);
    res.status(500).json({ message: 'Error creando contenido de nota de venta' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notaVenta = await TicketModel.getTicketById(id);

    if (!notaVenta) {
      return res.status(404).json({ message: 'Nota de venta no encontrada' });
    }

    const params = {
      Bucket: bucketName,
      Key: `notas_venta/${notaVenta.id}.pdf`,
    };

    s3.getObject(params, (error, data) => {
      if (error) {
        console.error('Error descargando el archivo:', error.message);
        return res.status(500).json({ message: 'Error al descargar el archivo' });
      }

      res.setHeader('Content-Disposition', `attachment; filename=${notaVenta.id}_nota_venta.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(data.Body);
    });
  } catch (error) {
    console.error('Error descargando la nota de venta:', error.message);
    res.status(500).json({ message: 'Error al descargar nota de venta' });
  }
});

module.exports = router;
