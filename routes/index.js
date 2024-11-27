const router = require('express').Router();
const addresses = require('./addresses');
const clients = require('./clients');
const products = require('./products');
const tickets = require('./tickets');

router.use('/clients', clients);
router.use('/addresses', addresses);
router.use('/products', products);
router.use('/tickets', tickets);

router.get('', (req, res) => {
  return res.send('API WORKING!!!! UwU');
});

module.exports = router;
