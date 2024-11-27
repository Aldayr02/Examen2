const router = require('express').Router();
const aws = require('aws-sdk');
const ClientModel = require('../model/client-model');

router.get('/', (req, res) => {
  ClientModel.getALL()
    .then((clients) => {
      res.send(clients[0]);
    })
    .catch((e) => {
      res.status(500).send({ error: e.message });
    });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  ClientModel.getById(id)
    .then((client) => {
      res.send(client);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

router.post('/', (req, res) => {
  const clientData = req.body;
  ClientModel.create(clientData)
    .then((newClient) => {
      res.status(201).send(newClient);
    })
    .catch((e) => {
      res.status(400).send({ error: e.message });
    });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const clientData = req.body;
  ClientModel.update(id, clientData)
    .then((updatedClient) => {
      res.send(updatedClient);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  ClientModel.delete(id)
    .then((result) => {
      res.send(result);
    })
    .catch((e) => {
      res.status(404).send({ error: e.message });
    });
});

module.exports = router;
