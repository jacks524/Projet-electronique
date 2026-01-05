# studam-web
Ce projet est la partie web de l'application STUDAM
## Lancement local (backend)
1. Démarrer la DB
   docker compose up -d db

2. Charger les variables d'environnement
   export $(grep -v '^#' .env | xargs)

3. Lancer l'application
   ./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=${SERVER_PORT}

Swagger: http://localhost:8081/api/swagger-ui/index.html
