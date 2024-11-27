const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const TicketModel = require('../model/ticket-model');
const { config } = require('dotenv');

config();

aws.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  sessionToken: process.env.aws_session_token,
  region: 'us-east-1',
});

const s3 = new aws.S3();
const bucketName = 'pdf-files-724577';
const sns = new aws.SNS();
const arn = 'arn:aws:sns:us-east-1:744988023230:examen-notification';

const uploadToS3 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
  };

  try {
    await s3.upload(params).promise();
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error uploading to S3 or deleting file:', error.message);
    throw new Error('Error uploading to S3');
  }
};

const generatePDF = async (notaVentaId) => {
  try {
    const notaVenta = await TicketModel.getTicketById(notaVentaId);
    console.log(notaVenta);

    if (!notaVenta || !notaVenta.contenido || notaVenta.contenido.length === 0) {
      throw new Error('Nota de venta no encontrada o sin contenido.');
    }

    const dirPath = path.resolve(__dirname, '../pdf');
    console.log('Directorio para PDF:', dirPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Directorio creado:', dirPath);
    } else {
      console.log('El directorio ya existe:', dirPath);
    }

    const filePath = path.join(dirPath, `notas_venta_${notaVentaId}.pdf`);
    console.log('Ruta del archivo PDF:', filePath);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    writeStream.on('finish', async () => {
      console.log('PDF escrito correctamente:', filePath);
      try {
        await uploadToS3(filePath, `notas_venta/${notaVentaId}.pdf`);
        console.log('PDF subido correctamente a S3');
      } catch (err) {
        console.error('Error subiendo el PDF a S3:', err);
      }
    });

    writeStream.on('error', (err) => {
      console.error('Error al escribir el PDF:', err);
      throw new Error('Error al escribir el PDF');
    });

    doc.pipe(writeStream);

    doc.fontSize(25).text('Nota de Venta', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`ID: ${notaVenta.id}`);
    doc.text(`Cliente ID: ${notaVenta.client_id}`);
    doc.text(`Dirección de Facturación: ${notaVenta.direccion_facturacion_id}`);
    doc.text(`Dirección de Envío: ${notaVenta.direccion_envio_id}`);
    doc.moveDown();

    doc.text('Contenido de la Nota de Venta:');
    notaVenta.contenido.forEach((item) => {
      doc.text(
        `Producto ID: ${item.product_id}, Cantidad: ${item.cantidad}, Importe: ${item.importe}`
      );
    });

    doc.moveDown();
    doc.text(`Total: ${notaVenta.total}`);

    doc.end();
  } catch (error) {
    console.error('Error generando el PDF:', error.message);
    throw new Error('Error al generar el PDF');
  }
};

const notifyClient = async (endpoint) => {
  const params = {
    Message: `Se ha generado su nota de venta. Puede descargarla aquí: ${endpoint}`,
    Subject: 'Nota de Venta Generada',
    TopicArn: arn,
  };

  try {
    await sns.publish(params).promise();
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw new Error('Error sending notification');
  }
};

module.exports = { generatePDF, uploadToS3, notifyClient, s3, bucketName };
