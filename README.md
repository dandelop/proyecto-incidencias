# Gestor de Incidencias

Aplicación web de gestión de incidencias para talleres de reparación de dispositivos electrónicos. Desarrollada como Proyecto Intermodular del ciclo de Desarrollo de Aplicaciones Web.

## Descripción

Herramienta diseñada para digitalizar el flujo de trabajo de un taller de reparación: desde la recepción del dispositivo hasta su entrega al cliente. Permite gestionar incidencias, clientes, equipos y empleados desde una única interfaz accesible desde cualquier navegador.

## Stack tecnológico

- **Frontend:** Vue 3 + Vue Router + Bootstrap 5
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Supabase)
- **Despliegue:** Vercel (frontend) · Render (backend) · Supabase (base de datos)

## Funcionalidades principales

- Gestión completa del ciclo de vida de una reparación con estados y fechas automáticas
- Sistema de roles: administrador y técnico
- Historial de incidencias por cliente y por equipo, con detección automática por número de serie
- Panel de estadísticas y registro de auditoría (solo administrador)
- Autenticación con JWT en cookie httpOnly

## Enlaces

- **Aplicación:** https://gestor-de-incidencias.vercel.app
- **API (Swagger):** https://proyecto-incidencias.onrender.com/api-docs

## Autor

Daniel de Andrés López — DAW 2025/2026
