FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# 👇 copy only backend folder
COPY backend/ .

RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

CMD ["java", "-jar", "target/studenthub-0.0.1-SNAPSHOT.jar"]