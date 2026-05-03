/*
  Punto de entrada del servidor Node.js + Express
  Configura y arranca la API REST con todos sus middlewares globales y rutas
 
  Orden de middlewares (Express los ejecuta en orden):
  1. trust proxy        -> necesario para que el rate limiter funcione detrás de Render
  2. cors               -> permite peticiones solo desde el frontend autorizado
  3. helmet             -> añade cabeceras de seguridad HTTP automáticamente
  4. cookieParser       -> habilita la lectura de cookies (necesario para el JWT)
  5. express.json       -> parsea el body de las peticiones JSON
  6. limiterGeneral     -> limita el número de peticiones por IP
  7. router             -> gestiona todas las rutas de la API bajo /api
  8. manejadorErrores   -> captura errores no gestionados (siempre al final)
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { limiterGeneral } from './middlewares/limiteAcceso.js'
import manejadorErrores from './middlewares/manejadorErrores.js'

// Swagger UI para documentación interactiva de la API
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'
import { parse } from 'yaml'

const app = express()
const swaggerDocument = parse(readFileSync('./swagger.yaml', 'utf8'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Necesario para que express-rate-limit identifique correctamente las IPs
// cuando el servidor está detrás de un proxy inverso (Render en producción)
app.set('trust proxy', 1)

// Solo acepta peticiones desde el origen del frontend configurado en .env
// credentials: true es necesario para que las cookies httpOnly funcionen con CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(limiterGeneral)

app.use('/api', router)

// El manejador de errores siempre va al final (captura cualquier error)
// lanzado en controllers o DAOs mediante next(err)
app.use(manejadorErrores)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})