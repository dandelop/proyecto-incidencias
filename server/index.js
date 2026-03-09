import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import router from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', router)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})