const router = require('express').Router();
const aws = require('aws-sdk');
const ProductModel = require('../model/product-model');

aws.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  sessionToken: '',
  region: 'us-east-1',
});

router.get('/', (req, res) => {
  ProductModel.getAll()
    .then((products) => {
      res.send(products[0]);
    })
    .catch((e) => {
      res.status(500).send({ error: e.message });
    });
});
router.get('/:id', (req, res) => {
  const { id } = req.params;
  ProductModel.getById(id)
    .then((product) => {
      res.send(product);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});
router.post('/', (req, res) => {
  const productData = req.body;
  ProductModel.create(productData)
    .then((newProduct) => {
      res.status(201).send(newProduct);
    })
    .catch((e) => {
      res.status(400).send({ error: e.message });
    });
});
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  ProductModel.update(id, productData)
    .then((updatedProduct) => {
      res.send(updatedProduct);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  ProductModel.delete(id)
    .then((message) => {
      res.send(message);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

module.exports = router;
