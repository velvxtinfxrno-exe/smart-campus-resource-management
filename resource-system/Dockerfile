# ─────────────────────────────────────────────────────────────
# Stage 1 — BUILD  (Maven + JDK 17, compiles the JAR)
# ─────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy dependency manifest first so Docker caches this layer
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build the fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -q

# ─────────────────────────────────────────────────────────────
# Stage 2 — RUN  (lightweight JRE only, no Maven)
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Pull only the compiled JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects $PORT at runtime; default to 8080 locally
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
