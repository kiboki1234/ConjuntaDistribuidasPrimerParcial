# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [No Publicado]
### Agregado
- Configuración inicial del proyecto con Express.js
- Integración con MySQL para almacenamiento persistente
- Modelos para Cliente, PersonaNatural y PersonaJuridica
- Controlador para evaluación de créditos
- Rutas de la API RESTful
- Sistema de logging con Winston
- Validación de datos de entrada
- Documentación de la API
- Configuración de variables de entorno
- Scripts para inicializar y resetear la base de datos
- Pruebas unitarias básicas
- Configuración de ESLint y Prettier
- Documentación en README.md

### Cambiado
- Mejorado el manejo de errores en los controladores
- Optimizadas las consultas a la base de datos
- Actualizadas las dependencias a sus últimas versiones estables

### Corregido
- Corregido el cálculo de capacidad de endeudamiento
- Solucionado problema con fechas en diferentes zonas horarias
- Corregida la validación de datos para personas jurídicas

## [0.1.0] - 2025-05-26
### Agregado
- Versión inicial del proyecto
- Estructura básica de archivos y directorios
- Configuración inicial de Express.js
- Conexión básica a MySQL

[No Publicado]: https://github.com/tu-usuario/sistema-evaluacion-crediticia/compare/v0.1.0...HEAD
