# Sistema de Dictámenes GEM

Este es el sistema para llevar el seguimiento de las solicitudes de dictámenes administrativos.

## Estructura del Proyecto

El sistema está compuesto por un frontend en React (creado con Vite y TailwindCSS) y un backend en Spring Boot (Java).

### Frontend (React + Vite)
El frontend proporciona la interfaz de usuario con diseños amigables, "Glassmorphism", un menú lateral, tableros de auditoría y reportes clave para interactuar con la Base de datos y el Backend de Java.

**Instalación y configuración local (Frontend):**
1. Asegúrate de tener instalado [Node.js](https://nodejs.org/es) (v18 o superior).
2. Abre la terminal en el directorio raíz del proyecto.
3. Ejecuta el comando para instalar las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```
5. El proyecto se abrirá en tu navegador (por defecto usualmente en `http://localhost:5173`).


### Backend (Java + Spring Boot)

El módulo backend se encuentra en la carpeta `/src-backend`. Su función es manejar la API REST para los listados, guardado, edición y las métricas para los tableros, guardando la información de toda la plataforma en una base de datos de MySQL local.

**Requisitos Previos (Backend):**
1. Java Development Kit (JDK 17).
2. [Maven](https://maven.apache.org/install.html) (Si usas un IDE moderno como IntelliJ IDEA o Eclipse, estos ya traen soporte para Maven embebido).
3. Servidor [MySQL](https://dev.mysql.com/downloads/installer/) corriendo en tu máquina (usuario: `root` y clave: `root` por defecto, ajustable en el backend). 

**Paso a paso para correr el Backend (Local):**
1. Abre MySQL (por ejemplo usando MySQL Workbench o HeidiSQL) y crea la base de datos vacía ejecutando la siguiente consulta:
   ```sql
   CREATE DATABASE db_Dictamenes;
   ```
2. Abre la carpeta `/src-backend` en tu IDE favorito de Java (IntelliJ IDEA, Eclipse, o VS Code con la extensión de Java). El archivo raíz para abrir el proyecto Java es `pom.xml`.
3. Revisa y ajusta si es necesario las credenciales en `/src-backend/main/resources/application.properties`. Por defecto está configurado así:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/db_Dictamenes?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   *(Cambia `root` y `root` por el usuario y contraseña reales de tu instalación local de MySQL).*
4. Si quieres correrlo desde tu línea de comandos dentro del folder `/src-backend`, usa Maven:
   ```bash
   mvn spring-boot:run
   ```
   O bien, ejecuta la clase principal `DictamenesApplication.java` directamente usando el botón 'Run' en tu Entorno de Desarrollo (IDE).
5. El sistema de bases de datos creará las tablas automáticamente (`spring.jpa.hibernate.ddl-auto=update`).
6. El backend se publicará en `http://localhost:8080`.

### Conectando Frontend con Backend

Dado que los servicios en React se comunican de forma dinámica utilizando fetch, una vez que el Backend esté arriba podrás cambiar los servicios o llamadas dentro de React (`fetch` o `axios`) apuntando hacia los endpoints que se crearon:
- `http://localhost:8080/api/solicitudes`
- `http://localhost:8080/api/dashboard/stats`
- `http://localhost:8080/api/auditoria`

## Despliegue en Producción (Render)

El proyecto está configurado para desplegarse de manera automatizada en **Render** a través de la infraestructura como código especificada en `render.yaml`.

### 1. Requisitos en Render
- Una cuenta en [Render](https://render.com/).
- Tener este repositorio conectado a tu cuenta de Render (Blueprint).

### 2. Base de Datos (PostgreSQL)
El archivo `render.yaml` creará automáticamente una instancia de base de datos PostgreSQL llamada `dictamenes-db` bajo el plan gratuito. 

### 3. Variables de Entorno Requeridas

#### Backend (Spring Boot - Docker)
Estas variables se configuran e inyectan automáticamente a través de la base de datos vinculada o del servicio web:
* **`DB_HOST`**: Host de la base de datos (se mapea automáticamente).
* **`DB_PORT`**: Puerto de la base de datos (se mapea automáticamente).
* **`DB_NAME`**: Nombre de la base de datos (se mapea automáticamente).
* **`DB_USERNAME`**: Usuario de la base de datos (se mapea automáticamente).
* **`DB_PASSWORD`**: Contraseña de la base de datos (se mapea automáticamente).
* **`JWT_SECRET`**: Generado de manera aleatoria automáticamente por Render al desplegar.
* **`SPRING_PROFILES_ACTIVE`**: Configurado como `prod` para activar la configuración segura de base de datos y ocultación de stack traces.
* **`FRONTEND_URL`**: Toma automáticamente la URL generada del frontend para configurar la protección CORS dinámica.

#### Frontend (React / Vite - Static Site)
* **`VITE_API_URL`**: Toma automáticamente la URL externa generada del backend (`RENDER_EXTERNAL_URL`).

### 4. Instrucciones de Despliegue en Render
1. Ve al Dashboard de Render.
2. Haz clic en **New** -> **Blueprint**.
3. Selecciona tu repositorio y haz clic en **Connect**.
4. Nombra tu grupo de servicios (ej. `dictamenes-app`).
5. Render creará:
   - La base de datos PostgreSQL (`dictamenes-db`).
   - El servicio del backend de Spring Boot compilando el `Dockerfile` de la carpeta `src-backend`.
   - El sitio estático del frontend compilando el bundle de React y Vite.
6. Espera a que termine la compilación de ambos servicios. ¡La aplicación estará en línea y segura!
