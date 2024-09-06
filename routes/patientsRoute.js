const router = require('express').Router()
const { getAllPatients, addPatients, getOnePatients, updatePatients, deletePatients, filterObj, deleteAllPatients, payCard } = require('../controllers/patientsController')

router.route('/')
    .get(getAllPatients)
    .post(filterObj, addPatients)
    .delete(deleteAllPatients)
router.route('/:id')
    .get(getOnePatients)
    .put(filterObj, updatePatients)
    .delete(deletePatients)

router.post('/checkout/:id', payCard)
module.exports = router