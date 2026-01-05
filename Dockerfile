FROM maven:3.8-openjdk-17-slim

WORKDIR /app

COPY . /app

ENV MAVEN_OPTS="-Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.timeout=600000 -Dmaven.wagon.httpconnectionManager.ttlSeconds=120"

RUN mvn -B clean install -DskipTests
RUN cp /app/target/*.jar /app/my-spring-boot-app.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/my-spring-boot-app.jar"]
