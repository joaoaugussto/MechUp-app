import cors from 'cors'
import express from 'express'
import carsRouter from './routes/cars'
import clientsRouter from './routes/clientes'
import servicesRouter from './routes/services'
import shopsRouter from './routes/shops'
import authRouter from './routes/auth'
import { authMiddleware } from './middleware/auth'
import adminRouter from './routes/admin'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/shops', shopsRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api', authMiddleware)
app.use('/api/clientes', clientsRouter)
app.use('/api/cars', carsRouter)
app.use('/api/services', servicesRouter)

const PORT = 3333
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
})