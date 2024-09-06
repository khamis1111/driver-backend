const authRoutes = require('./authRoutes')
const patients = require('./patientsRoute')

const routesMount = (app) => {
    app.use('/api/v1/auth', authRoutes)
    app.use('/api/v1/patients', patients)
}
module.exports = routesMount