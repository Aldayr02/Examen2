const router = require('express').Router();
const AddressModel = require('../model/address-model');

router.get('/', (req, res) => {
  AddressModel.getAll()
    .then((addresses) => {
      res.send(addresses[0]);
    })
    .catch((e) => {
      res.status(500).send({ error: e.message });
    });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  AddressModel.getById(id)
    .then((address) => {
      res.send(address);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

router.post('/', (req, res) => {
  const addressData = req.body;
  AddressModel.create(addressData)
    .then((newAddress) => {
      res.status(201).send(newAddress);
    })
    .catch((e) => {
      res.status(400).send({ error: e.message });
    });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const addressData = req.body;
  AddressModel.update(id, addressData)
    .then((updatedAddress) => {
      res.send(updatedAddress);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  AddressModel.delete(id)
    .then((response) => {
      res.send(response);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

module.exports = router;
