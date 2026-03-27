FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# ✅ MAKE MAVEN WRAPPER EXECUTABLE (IMPORTANT)
RUN chmod +x mvnw

# ✅ BUILD PROJECT
RUN ./mvnw clean package -DskipTests

# ✅ RUN JAR
CMD ["java", "-jar", "target/studenthub-0.0.1-SNAPSHOT.jar"]