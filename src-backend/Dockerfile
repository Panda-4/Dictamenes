# Stage 1: Construcción
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY main ./main
# Empaquetar la aplicación ignorando pruebas para un build más rápido
RUN mvn clean package -DskipTests

# Stage 2: Ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/dictamenes-0.0.1-SNAPSHOT.jar app.jar

# Render asigna el puerto 8080 o el puerto definido en la variable de entorno PORT
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
