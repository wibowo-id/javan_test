const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  create,
  getAll,
  getOne,
  update,
  delete: deleteContact,
} = require('../controllers/contactController');

router.post('/', upload.single('foto'), create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', upload.single('foto'), update);
router.delete('/:id', deleteContact);

module.exports = router;
