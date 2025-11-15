# 🐾 Sistema de Gestión - Refugio de Animales

Sistema completo de gestión para refugios de animales con autenticación de usuarios, CRUD de animales, gestión de adopciones y registro de actividades.

## 📋 Características

- ✅ Autenticación y registro de usuarios
- ✅ Sistema de roles (Administrador, Usuario, Invitado)
- ✅ CRUD completo de animales
- ✅ Gestión de especies y razas
- ✅ Registro de adopciones
- ✅ Filtros y búsqueda de animales
- ✅ Gestión de usuarios (administrador)
- ✅ Registro de actividades del sistema
- ✅ Base de datos en Supabase
- ✅ Diseño responsive

## 🚀 Instalación

### Paso 1: Descargar el proyecto
Descarga todos los archivos y organízalos según la estructura:
```
refugio-animales/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── config.js
    ├── supabase-client.js
    ├── auth.js
    ├── animals.js
    └── app.js
```

### Paso 2: Configurar la Base de Datos en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu proyecto
3. Ve a la sección "SQL Editor"
4. Copia y ejecuta el script SQL completo (ver más abajo)
5. Verifica que todas las tablas se hayan creado correctamente

### Paso 3: Ejecutar el Proyecto

#### Opción 1: Servidor Local con Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Luego abre: `http://localhost:8000`

#### Opción 2: Servidor Local con Node.js
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000
```
Luego abre: `http://localhost:8000`

#### Opción 3: Live Server (VS Code)
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

#### Opción 4: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador (puede tener limitaciones con CORS)

## 👤 Usuario por Defecto

- **Usuario:** administrador
- **Contraseña:** Admin2025
- **Rol:** Administrador

## 🔑 Roles y Permisos

### Administrador
- Acceso total al sistema
- Crear, editar y eliminar animales
- Gestionar usuarios y cambiar roles
- Ver registro de actividades
- Registrar adopciones

### Usuario
- Crear y editar animales
- Ver todos los animales
- Registrar adopciones
- No puede eliminar animales
- No puede gestionar usuarios

### Invitado
- Solo lectura
- Ver animales disponibles
- No puede crear, editar ni eliminar

## 🗄️ Estructura de la Base de Datos

El sistema utiliza las siguientes tablas:
- `usuarios` - Información de usuarios del sistema
- `animales` - Registro de animales del refugio
- `especies` - Catálogo de especies
- `razas` - Catálogo de razas por especie
- `estados_salud` - Estados de salud de los animales
- `adopciones` - Registro de adopciones
- `actividades` - Log de actividades del sistema
- `sesiones` - Control de sesiones de usuario

## 📝 Uso del Sistema

### Registro e Inicio de Sesión
1. La primera vez, usa el usuario administrador por defecto
2. O registra un nuevo usuario (será Usuario estándar)
3. El primer usuario registrado será Administrador

### Gestión de Animales
1. Ve a "Nuevo Animal"
2. Completa el formulario con toda la información
3. Selecciona especie y raza
4. Guarda el animal

### Adopciones
1. En el dashboard, busca el animal disponible
2. Click en "Adoptar"
3. Ingresa los datos del adoptante
4. El animal cambiará a estado "Adoptado"

### Gestión de Usuarios (Solo Administrador)
1. Ve a la sección "Usuarios"
2. Cambia roles usando el selector
3. Activa o desactiva usuarios

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Supabase (PostgreSQL)
- **Diseño:** CSS Grid, Flexbox
- **Almacenamiento:** localStorage para sesiones

## 🔧 Configuración Avanzada

### Cambiar URL de Supabase
Edita el archivo `js/config.js`:
```javascript
const SUPABASE_CONFIG = {
    url: 'TU_URL_DE_SUPABASE',
    anonKey: 'TU_API_KEY'
};
```

### Personalizar Roles
Edita el archivo `js/config.js`:
```javascript
const ROLES = {
    ADMIN: 'Administrador',
    USER: 'Usuario',
    GUEST: 'Invitado'
};
```

## 📧 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo licencia MIT.