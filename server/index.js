import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { limiterGeneral } from './middlewares/limiteAcceso.js'
import manejadorErrores from './middlewares/manejadorErrores.js'

const app = express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(limiterGeneral)

app.use('/api', router)

app.use(manejadorErrores)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})