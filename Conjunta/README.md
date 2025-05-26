# Sistema de Evaluación de Créditos

API RESTful para evaluar solicitudes de crédito para personas naturales y jurídicas, con diferentes niveles de riesgo y almacenamiento en base de datos MySQL.

## Características

- Evaluación de crédito con diferentes niveles de riesgo
- Almacenamiento persistente en base de datos MySQL
- Gestión de clientes (personas naturales y jurídicas)
- Historial completo de evaluaciones
- Documentación de API con ejemplos
- Manejo de errores y validación de datos
- Logging detallado

## Requisitos

- Node.js (v16 o superior)
- npm (v8 o superior)
- MySQL (v5.7 o superior)
- Cuenta en Clever Cloud (para la base de datos en la nube)

## Configuración Inicial

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd nombre-del-repositorio
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Configurar las credenciales de la base de datos

4. Inicializar la base de datos:
   ```bash
   npm run db:init
   ```
   
   Para reiniciar la base de datos (cuidado: elimina todos los datos):
   ```bash
   npm run db:reset
   ```

5. Iniciar el servidor:
   ```bash
   # Modo desarrollo (con recarga automática)
   npm run dev
   
   # Modo producción
   npm start
   ```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de la base de datos
MYSQL_ADDON_HOST=tu-host-de-mysql
MYSQL_ADDON_DB=nombre_de_la_base_de_datos
MYSQL_ADDON_USER=usuario
MYSQL_ADDON_PASSWORD=contraseña
MYSQL_ADDON_PORT=3306

# Configuración de la aplicación
NODE_ENV=development
PORT=3000
JWT_SECRET=tu_clave_secreta_jwt

# Configuración de logs
LOG_LEVEL=info
```

## Estructura del Proyecto

```
src/
├── config/               # Configuraciones
│   ├── database.js       # Configuración de la base de datos
│   └── init-db.js        # Script de inicialización de la base de datos
├── controllers/          # Controladores de la API
├── middlewares/          # Middlewares de Express
├── models/               # Modelos de datos
├── routes/               # Rutas de la API
├── services/             # Lógica de negocio
├── utils/                # Utilidades y helpers
├── app.js                # Aplicación Express
└── index.js              # Punto de entrada
```

## Endpoints de la API

### Evaluar Crédito

**POST** `/api/evaluar`

Evalúa una solicitud de crédito y la almacena en la base de datos.

**Ejemplo de solicitud (Persona Natural):**
```http
POST /api/evaluar
Content-Type: application/json

{
  "tipoCliente": "NATURAL",
  "nombre": "Juan Pérez",
  "puntajeCrediticio": 750,
  "deudasActuales": [
    { "monto": 5000, "plazoMeses": 12, "descripcion": "Préstamo personal" }
  ],
  "montoSolicitado": 10000,
  "plazoEnMeses": 24,
  "edad": 30,
  "ingresoMensual": 3000
}
```

**Ejemplo de solicitud (Persona Jurídica):**
```http
POST /api/evaluar
Content-Type: application/json

{
  "tipoCliente": "JURIDICO",
  "nombre": "Mi Empresa S.A.",
  "puntajeCrediticio": 650,
  "deudasActuales": [
    { "monto": 20000, "plazoMeses": 24, "descripcion": "Préstamo empresarial" }
  ],
  "montoSolicitado": 50000,
  "plazoEnMeses": 60,
  "antiguedadAnios": 5,
  "ingresoAnual": 120000,
  "empleados": 15
}
```

### Obtener Historial de Evaluaciones

**GET** `/api/historial`

Obtiene el historial completo de evaluaciones realizadas.

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "fecha": "2025-05-26T13:45:30.000Z",
    "cliente": {
      "id": 1,
      "nombre": "Juan Pérez",
      "tipo": "NATURAL"
    },
    "resultado": {
      "aprobado": true,
      "montoAprobado": 8000,
      "nivelRiesgo": "MEDIO",
      "mensaje": "Crédito aprobado con condiciones"
    }
  }
]
```

### Obtener Lista de Clientes

**GET** `/api/clientes`

Obtiene una lista de todos los clientes con información resumida.

### Obtener Detalles de un Cliente

**GET** `/api/cliente/:id`

Obtiene los detalles completos de un cliente, incluyendo sus deudas y evaluaciones.

### Verificar Estado del Servidor

**GET** `/status`

Verifica que el servidor esté en funcionamiento.

## Niveles de Riesgo

- **Bajo riesgo (puntaje >= 800):**
  - Hasta el 30% del ingreso mensual anualizado
  - Tasa de interés preferencial
  
- **Riesgo medio (600-799):**
  - Hasta el 40% del ingreso mensual anualizado
  - Máximo 80% del monto solicitado
  - Tasa de interés estándar
  
- **Alto riesgo (< 600):**
  - Hasta el 50% del ingreso mensual anualizado
  - Máximo 60% del monto solicitado
  - Tasa de interés más alta

## Requisitos de Aprobación

### Persona Natural:
- Mayor de 18 años
- Ingreso mensual suficiente para cubrir la cuota propuesta
- Deuda total no exceda el porcentaje permitido según el nivel de riesgo

### Persona Jurídica:
- Mínimo 2 años de antigüedad
- Mínimo 6 empleados
- Ingresos anuales que respalden la capacidad de pago
- Deuda total no exceda el porcentaje permitido según el nivel de riesgo

## Pruebas

Para ejecutar las pruebas unitarias:

```bash
npm test
```

Para ejecutar las pruebas con cobertura de código:

```bash
npm run test:coverage
```

## Despliegue

El sistema está preparado para desplegarse en entornos cloud como:
- Heroku
- AWS
- Google Cloud
- Clever Cloud

Asegúrate de configurar correctamente las variables de entorno en el entorno de producción.

## Seguridad

- Todas las conexiones a la base de datos usan SSL
- Validación de datos en todos los endpoints
- Manejo seguro de contraseñas y datos sensibles
- Protección contra inyección SQL

## Monitoreo

Se recomienda implementar herramientas de monitoreo como:
- PM2 para gestión de procesos
- Winston para logging
- New Relic o Datadog para monitoreo en producción

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
