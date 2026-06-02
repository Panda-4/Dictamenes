# Guía de Despliegue en Servidor Ubuntu

Esta guía detalla los pasos para instalar, configurar y desplegar el sistema (Backend Spring Boot y Frontend React/Vite) en un servidor con **Ubuntu Server** (20.04 / 22.04 LTS o superior).

---

## 1. Requisitos Previos e Instalación de Dependencias

Conéctate a tu servidor por SSH y actualiza el sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar Java Runtime Environment (JRE/JDK 17 o superior)
Spring Boot requiere Java para ejecutarse. Instalaremos OpenJDK 17:
```bash
sudo apt install openjdk-17-jre-y
# Verifica la instalación:
java -version
```

### Instalar y Configurar la Base de Datos (MySQL)
Si el backend usa MySQL, instálalo con:
```bash
sudo apt install mysql-server -y
```
Inicia y asegura la instalación:
```bash
sudo systemctl start mysql
sudo mysql_secure_installation
```
Crea la base de datos y el usuario de producción:
```bash
sudo mysql -u root -p
```
Dentro de la consola de MySQL ejecuta:
```sql
CREATE DATABASE db_Dictamenes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'usr_dictamenes'@'localhost' IDENTIFIED BY 'TuContraseñaSegura';
GRANT ALL PRIVILEGES ON db_Dictamenes.* TO 'usr_dictamenes'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. Compilación del Sistema (En tu máquina local)

Es recomendable compilar los proyectos localmente para no saturar los recursos de memoria del servidor durante la compilación.

### A) Compilar el Backend (Generar JAR)
Desde la terminal en el directorio `/src-backend` de tu máquina local:
```bash
# Si tienes maven instalado globalmente:
mvn clean package -DskipTests
```
Esto generará el archivo ejecutable en:
`src-backend/target/dictamenes-0.0.1-SNAPSHOT.jar`

Sube este archivo `.jar` a tu servidor Ubuntu usando SCP o SFTP:
```bash
scp src-backend/target/dictamenes-0.0.1-SNAPSHOT.jar usuario@ip_de_tu_servidor:/home/usuario/dictamenes-backend.jar
```

### B) Compilar el Frontend (Generar archivos estáticos)
Desde el directorio raíz de tu proyecto frontend (donde está `package.json`) localmente:
1. Crea/modifica tu archivo `.env` de producción para apuntar al backend:
   ```env
   VITE_API_URL=https://tu-dominio.com
   ```
2. Compila el frontend:
   ```bash
   npm run build
   ```
Esto creará una carpeta llamada `dist/` con los archivos HTML, CSS y JS optimizados.
Empaqueta y sube esta carpeta al servidor:
```bash
tar -czf dist.tar.gz dist/
scp dist.tar.gz usuario@ip_de_tu_servidor:/home/usuario/
```

---

## 3. Configuración del Backend en el Servidor (Systemd)

Para que el backend corra en segundo plano y se inicie automáticamente con el servidor, crearemos un servicio de **Systemd**.

1. Crea la carpeta de la aplicación en el servidor:
   ```bash
   sudo mkdir -p /var/www/dictamenes/backend
   sudo mv /home/usuario/dictamenes-backend.jar /var/www/dictamenes/backend/
   sudo chown -R www-data:www-data /var/www/dictamenes
   ```
2. Crea el archivo de servicio de Systemd:
   ```bash
   sudo nano /etc/systemd/system/dictamenes-backend.service
   ```
3. Pega el siguiente contenido (asegúrate de ajustar las credenciales de la base de datos y la clave JWT):
   ```ini
   [Unit]
   Description=Dictamenes Backend Spring Boot Service
   After=syslog.target network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/dictamenes/backend
   ExecStart=/usr/bin/java -jar dictamenes-backend.jar
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   # Variables de Entorno de Producción
   Environment=SPRING_PROFILES_ACTIVE=prod
   Environment=DB_URL=jdbc:mysql://localhost:3306/db_Dictamenes?useSSL=false&serverTimezone=UTC
   Environment=DB_USERNAME=usr_dictamenes
   Environment=DB_PASSWORD=TuContraseñaSegura
   Environment=JWT_SECRET=UnSecretMuyLargoYMuySeguroParaElInicioDeSesion2026!
   Environment=FRONTEND_URL=https://tu-dominio.com

   [Install]
   WantedBy=multi-user.target
   ```
4. Guarda el archivo (`Ctrl + O`, `Enter`, `Ctrl + X`), recarga los servicios y arráncalo:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start dictamenes-backend
   sudo systemctl enable dictamenes-backend
   ```
5. Comprueba el estado del backend:
   ```bash
   sudo systemctl status dictamenes-backend
   ```

---

## 4. Configuración del Frontend y Servidor Web (Nginx)

Nginx servirá los archivos estáticos de React y actuará como Proxy Reverso para pasar las peticiones `/api/*` al backend de Spring Boot (que corre localmente en el puerto `8080`).

### Instalar Nginx
```bash
sudo apt install nginx -y
```

### Descomprimir y colocar el Frontend
```bash
sudo mkdir -p /var/www/dictamenes/frontend
tar -xzf /home/usuario/dist.tar.gz -C /home/usuario/
sudo mv /home/usuario/dist/* /var/www/dictamenes/frontend/
sudo chown -R www-data:www-data /var/www/dictamenes/frontend
```

### Configurar el Bloque de Servidor (Virtual Host) en Nginx
1. Crea un nuevo archivo de configuración:
   ```bash
   sudo nano /etc/nginx/sites-available/dictamenes
   ```
2. Pega la siguiente configuración (reemplaza `tu-dominio.com` por tu dominio o IP pública):
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       # Servir archivos estáticos del frontend
       location / {
           root /var/www/dictamenes/frontend;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Proxy reverso para redirigir peticiones API al backend
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
3. Habilita el sitio y reinicia Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dictamenes /etc/nginx/sites-enabled/
   # Deshabilita el sitio por defecto si es necesario
   sudo rm /etc/nginx/sites-enabled/default
   # Verifica que la sintaxis de Nginx sea correcta:
   sudo nginx -t
   # Reinicia el servicio:
   sudo systemctl restart nginx
   ```

---

## 5. Habilitar HTTPS con SSL Gratis (Let's Encrypt)

Es crítico asegurar el canal de producción con SSL. Instalaremos `certbot`:
```bash
sudo apt install certbot python3-certbot-nginx -y
```
Ejecuta certbot para configurar automáticamente el certificado HTTPS en Nginx:
```bash
sudo certbot --nginx -d tu-dominio.com
```
Sigue los pasos interactivos. Certbot actualizará automáticamente la configuración de Nginx para redirigir todo el tráfico HTTP a HTTPS de manera segura.
