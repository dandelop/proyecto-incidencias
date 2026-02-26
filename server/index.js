// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors()); // El vigilante de los permisos que hablamos
app.use(express.json()); // Para que tu servidor entienda el JSON que le mandará Vue

// Ruta de prueba (Punto 7 de tu pizarra)
app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: "¡Hola desde Node.js!",
        estado: "Servidor funcionando correctamente",
        fecha: new Date().toLocaleString()
    });
});

// El puerto lo saca del .env o usa el 3000 por defecto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});