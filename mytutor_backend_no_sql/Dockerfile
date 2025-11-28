# --- Etapa 1: Construcción del JAR ---
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar pom.xml y descargar dependencias (cache)
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Copiar el resto del proyecto y compilar
COPY . .
RUN mvn -B clean package -DskipTests

# --- Etapa 2: Imagen final ligera ---
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR construido
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
