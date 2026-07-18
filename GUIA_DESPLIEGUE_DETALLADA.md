# Guía Paso a Paso para Despliegue en Producción (Servidor Ubuntu)
## Dirigida a Principiantes (Desde Windows)

Esta guía te llevará paso a paso para desplegar tu aplicación (Frontend en React + Backend en Spring Boot + Base de Datos MySQL) en un servidor virtual con **Ubuntu Server** utilizando tu computadora local con **Windows**.

---

## 🗺️ Mapa de la Arquitectura
Antes de empezar, es importante entender cómo funcionará el sistema en el servidor:

```mermaid
graph TD
    User([Cliente / Navegador]) -->|HTTPS: Puerto 443 / HTTP: Puerto 80| Nginx[Servidor Nginx]
    Nginx -->|Sirve directamente| Frontend[Archivos React estáticos /var/www/monitoreo/frontend]
    Nginx -->|Redirige /api/* (Proxy)| Backend[Spring Boot .jar Puerto 8080]
    Backend -->|Consulta / Guarda| DB[(Base de Datos MySQL Puerto 3306)]
```

*   **Frontend (React/Vite):** Se compila en archivos estáticos (HTML, CSS, JS) y Nginx los sirve de manera ultra-rápida.
*   **Backend (Spring Boot):** Se ejecuta en segundo plano como un servicio del sistema y escucha en el puerto `8080`.
*   **Nginx:** Actúa como el receptor principal de todo el tráfico de internet, protegiendo al backend (Proxy Reverso) y sirviendo el frontend.

---

## 🛠️ Requisitos Previos en tu Computadora (Windows)
Asegúrate de tener instalado en tu Windows:
1.  **Node.js** (para compilar el frontend): [Descargar Node.js](https://nodejs.org/) (versión LTS recomendada).
2.  **Java JDK 17** (para compilar el backend): [Descargar JDK 17](https://www.oracle.com/java/technologies/downloads/#java17).
3.  **Maven** (opcional, si compilarás directo con comandos Maven) o puedes usar el empaquetador del IDE (STS, IntelliJ o VS Code).
4.  **WinSCP o FileZilla**: Software visual gratuito para arrastrar y soltar archivos del Windows al Ubuntu. [Descargar WinSCP](https://winscp.net/).
5.  **Terminal**: Usaremos **PowerShell** (que viene integrado en Windows).

---

## 📁 PASO 1: Compilación de la Aplicación en tu Windows

Para evitar consumir los recursos de memoria de tu servidor Ubuntu, **compilaremos todo en tu máquina local** y solo subiremos los resultados listos para ejecutar.

### A) Compilar el Frontend (React)
1. Abre una terminal de **PowerShell** en la carpeta raíz del proyecto frontend (`Monitoreo-main`).
2. Crea un archivo llamado `.env.production` en esa misma carpeta (si no existe) y agrega la URL de tu servidor:
   ```env
   VITE_API_URL=https://tu-dominio.com
   ```
   > ⚠️ **Nota Importante:** Si aún no tienes un dominio web (ej. `mi-app.com`) y vas a acceder usando la dirección IP pública del servidor, pon:
   > ```env
   > VITE_API_URL=http://TU_IP_PUBLICA
   > ```
3. Instala las dependencias y compila:
   ```powershell
   npm install
   npm run build
   ```
4. Al finalizar, se habrá creado una carpeta llamada **`dist`** en tu proyecto.
5. Para que la transferencia sea rápida, haz clic derecho sobre la carpeta `dist`, selecciona **Enviar a > Carpeta comprimida (en zip)**. Cámbiale el nombre a `frontend.zip`.

---

### B) Compilar el Backend (Spring Boot)
1. Abre tu terminal en la carpeta `/src-backend` (donde está el archivo `pom.xml`).
2. Ejecuta el comando para compilar el proyecto y saltarte los tests (para agilizar el proceso):
   ```powershell
   mvn clean package -DskipTests
   ```
   *Si no tienes Maven instalado en las variables de entorno de Windows, puedes hacerlo directamente desde tu editor de código (IntelliJ, Eclipse o VS Code) usando la opción "Maven -> Lifecycle -> package".*
3. Esto generará un archivo ejecutable en: `src-backend/target/dictamenes-0.0.1-SNAPSHOT.jar`.
4. Copia ese archivo `.jar` a una carpeta fácil de encontrar y renómbralo a: `dictamenes-backend.jar`.

---

## 🔌 PASO 2: Conexión y Subida de Archivos al Servidor

Para este paso necesitas los accesos a tu servidor: **IP Pública**, **Usuario** (suele ser `ubuntu` o `root`) y **Contraseña** (o archivo de clave privada `.pem` / `.ppk`).

### A) Conectarse por Consola (SSH)
Abre PowerShell y ejecuta:
```powershell
ssh usuario@IP_DE_TU_SERVIDOR
```
*(Ejemplo: `ssh ubuntu@192.168.1.50`)*
Te pedirá la contraseña. Escríbela (no se verá nada en pantalla mientras escribes por seguridad) y presiona Enter. ¡Ya estás dentro de tu servidor!

---

### B) Subir los Archivos con WinSCP (Interfaz Visual)
Para no complicarte con comandos de consola para transferir archivos, usaremos **WinSCP**:
1. Abre **WinSCP**.
2. Configura una nueva conexión:
   * **Protocolo de envío:** `SFTP`
   * **Nombre del host:** `IP_DE_TU_SERVIDOR`
   * **Puerto:** `22`
   * **Usuario:** `ubuntu` (o el usuario de tu servidor)
   * **Contraseña:** `Tu contraseña` (si usas clave privada, haz clic en *Avanzado... -> SSH -> Autenticación* y carga tu archivo de clave).
3. Haz clic en **Conectar**.
4. Verás dos paneles: a la izquierda tus archivos de Windows, a la derecha los de Ubuntu.
5. En el panel izquierdo busca `dictamenes-backend.jar` y `frontend.zip`.
6. En el panel derecho colócate en la carpeta del usuario (`/home/ubuntu/` o `/home/nombre_usuario/`).
7. **Arrastra ambos archivos de la izquierda hacia la derecha** para subirlos.

---

## 🖥️ PASO 3: Preparación del Servidor Ubuntu (Instalación de Software)

De vuelta en la consola SSH de tu servidor (PowerShell conectada al servidor), ejecuta los siguientes comandos paso a paso:

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Java 17
El backend requiere Java para correr. Instalamos el entorno de ejecución:
```bash
sudo apt install openjdk-17-jre -y
# Verifica que se instaló correctamente con:
java -version
```

### 3. Instalar la Base de Datos (MySQL)
```bash
sudo apt install mysql-server -y
```
Inicia el servicio y asegúralo:
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

---

## 🗄️ PASO 4: Configurar la Base de Datos y el Esquema

### 1. Entrar a MySQL
```bash
sudo mysql -u root
```

### 2. Crear base de datos y usuario
Copia y pega este bloque de código dentro de la terminal de MySQL:
```sql
CREATE DATABASE db_Dictamenes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'usr_dictamenes'@'localhost' IDENTIFIED BY 'PonAquiUnaContrasenaSegura123!';
GRANT ALL PRIVILEGES ON db_Dictamenes.* TO 'usr_dictamenes'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
> 🔒 **Guarda bien esa contraseña**, la usaremos más adelante.

---

## 🏃 PASO 5: Desplegar el Backend como un Servicio del Sistema

Crearemos un servicio en Ubuntu para que el backend Spring Boot corra en segundo plano, se inicie solo si el servidor se apaga o reinicia, y podamos controlarlo fácilmente.

### 1. Crear directorios y mover el archivo `.jar`
```bash
sudo mkdir -p /var/www/monitoreo/backend
# Mueve el archivo que subiste al directorio definitivo
sudo mv /home/ubuntu/dictamenes-backend.jar /var/www/monitoreo/backend/
```

### 2. Crear el archivo de configuración del servicio
```bash
sudo nano /etc/systemd/system/monitoreo-backend.service
```
Se abrirá un editor de texto en blanco. Pega exactamente lo siguiente:

```ini
[Unit]
Description=Servicio Backend Monitoreo Spring Boot
After=syslog.target network.target mysql.service

[Service]
User=root
WorkingDirectory=/var/www/monitoreo/backend
ExecStart=/usr/bin/java -jar dictamenes-backend.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

# === VARIABLES DE ENTORNO DE PRODUCCIÓN ===
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=DB_URL=jdbc:mysql://localhost:3306/db_Dictamenes?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
Environment=DB_USERNAME=usr_dictamenes
# Coloca la contraseña que creaste en el paso 4
Environment=DB_PASSWORD=PonAquiUnaContrasenaSegura123!
# Cambia esta clave por una cadena larga aleatoria
Environment=JWT_SECRET=UnSecretMuyLargoYMuySeguroParaElInicioDeSesion2026!
# Reemplaza con la IP pública o el dominio final de tu frontend
Environment=FRONTEND_URL=http://IP_DE_TU_SERVIDOR,https://tu-dominio.com

[Install]
WantedBy=multi-user.target
```

> 💡 **Tip para usar Nano:** Para guardar presiona `Ctrl + O`, luego presiona `Enter` y para salir presiona `Ctrl + X`.

---

### ⚠️ IMPORTANTE: Inicialización de Tablas por primera vez
Como definimos el perfil `prod` (Producción), Spring Boot espera que la base de datos ya tenga creadas las tablas (`spring.jpa.hibernate.ddl-auto=validate`). Si arrancamos el backend ahora, fallará porque la base de datos está vacía.

**Solución fácil para principiantes (Creación automática por primera vez):**
1. Vamos a arrancar temporalmente el backend en modo desarrollo (`dev`) para que cree las tablas automáticamente.
2. Abre la configuración del servicio:
   ```bash
   sudo nano /etc/systemd/system/monitoreo-backend.service
   ```
3. Busca la línea:
   `Environment=SPRING_PROFILES_ACTIVE=prod`
   Y cámbiala temporalmente a:
   `Environment=SPRING_PROFILES_ACTIVE=dev`
4. Guarda y cierra (`Ctrl + O`, `Enter`, `Ctrl + X`).
5. Recarga y arranca el servicio:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start monitoreo-backend
   ```
6. Espera unos 15 segundos a que Spring Boot conecte a la base de datos y cree las tablas. Puedes ver que está corriendo con:
   ```bash
   sudo systemctl status monitoreo-backend
   ```
7. Ahora que las tablas se crearon con éxito, detén el servicio y cámbialo a producción:
   ```bash
   sudo systemctl stop monitoreo-backend
   sudo nano /etc/systemd/system/monitoreo-backend.service
   ```
8. Cambia de nuevo a `prod`:
   `Environment=SPRING_PROFILES_ACTIVE=prod`
9. Guarda y reinicia el servicio de forma definitiva:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start monitoreo-backend
   # Configúralo para que inicie automáticamente al encender el servidor:
   sudo systemctl enable monitoreo-backend
   ```

---

## 🌐 PASO 6: Desplegar el Frontend y Configurar Nginx

Nginx se encargará de recibir las conexiones del navegador. Si entran a la página principal, les entregará el React (Frontend). Si solicitan algo que empieza por `/api`, se lo pasará en secreto a Spring Boot (Backend) en el puerto `8080`.

### 1. Instalar Nginx y Unzip (para descomprimir el frontend)
```bash
sudo apt install nginx unzip -y
```

### 2. Colocar los archivos del Frontend
```bash
sudo mkdir -p /var/www/monitoreo/frontend
# Descomprimir el frontend.zip en el directorio definitivo
sudo unzip /home/ubuntu/frontend.zip -d /var/www/monitoreo/frontend/
```
> Si al descomprimir se creó una subcarpeta llamada `dist`, mueve los archivos para que queden directo en la carpeta `frontend`:
> ```bash
> # Ejecuta esto solo si tus archivos quedaron dentro de /var/www/monitoreo/frontend/dist/
> sudo mv /var/www/monitoreo/frontend/dist/* /var/www/monitoreo/frontend/
> sudo rmdir /var/www/monitoreo/frontend/dist/
> ```

Asegura los permisos correctos para que Nginx pueda leer la carpeta:
```bash
sudo chown -R www-data:www-data /var/www/monitoreo/frontend
```

---

### 3. Configurar el bloque de servidor en Nginx
1. Abre un nuevo archivo de configuración en Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/monitoreo
   ```
2. Pega la siguiente configuración. Reemplaza `tu-dominio.com` por tu dominio. Si no tienes uno, coloca la `IP_DE_TU_SERVIDOR` en `server_name`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com IP_DE_TU_SERVIDOR;

    # Servir archivos estáticos del frontend React
    location / {
        root /var/www/monitoreo/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Redirigir peticiones API al backend Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuración de tamaño máximo para archivos subidos (ej: Excel grandes)
    client_max_body_size 20M;
}
```
3. Guarda y cierra (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

### 4. Activar el sitio en Nginx
1. Enlaza el archivo creado para activarlo:
   ```bash
   sudo ln -s /etc/nginx/sites-available/monitoreo /etc/nginx/sites-enabled/
   ```
2. Desactiva el sitio por defecto de Nginx (para evitar conflictos):
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```
3. Verifica que la sintaxis de Nginx no tenga errores:
   ```bash
   sudo nginx -t
   ```
   *Debería decir: `syntax is ok` y `test is successful`.*
4. Reinicia Nginx para aplicar los cambios:
   ```bash
   sudo systemctl restart nginx
   ```

---

## 🔒 PASO 7 (Opcional pero recomendado): Activar SSL (HTTPS) con Let's Encrypt

Si tienes un dominio apuntando a tu servidor (ej. `mi-app.com`), es indispensable ponerle candado de seguridad (HTTPS). Con Ubuntu es gratis y automático:

1. Instala `certbot` y su plugin de Nginx:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```
2. Ejecuta certbot especificando tu dominio:
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```
3. Te pedirá un correo electrónico para avisar si el certificado va a expirar y que aceptes los términos de servicio (presiona `Y`).
4. Certbot modificará la configuración de Nginx de forma automática para obligar el uso de HTTPS y renovará el certificado gratis cada 3 meses por sí solo.

---

## 🔍 Comandos útiles para Monitoreo y Solución de Problemas

Si algo no funciona, puedes usar estos comandos en la terminal de tu servidor para ver qué está pasando:

* **Ver el estado de tu Backend:**
  ```bash
  sudo systemctl status monitoreo-backend
  ```
* **Ver logs del Backend en tiempo real (para ver errores de Java):**
  ```bash
  sudo journalctl -u monitoreo-backend -f
  ```
* **Ver errores del servidor Web Nginx:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
* **Reiniciar servicios si hiciste un cambio de código:**
  ```bash
  # Si subes un nuevo .jar del backend:
  sudo systemctl restart monitoreo-backend
  # Si haces cambios en Nginx o subes nuevo frontend:
  sudo systemctl restart nginx
  ```

¡Listo! Con estos pasos, tu aplicación ya estará totalmente funcional y en producción de forma profesional.
