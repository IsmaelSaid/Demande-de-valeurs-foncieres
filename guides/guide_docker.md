# Docker cheat sheet

télécharger une image postgres
```
docker pull postgres:alpine 
```

lancez une image postgres: 
```
docker run --name postgres-0 -e POSTGRES_PASSWORD=password -d -p 5432:5432 -d postgis/postgis
```
Attention à ne pas confondre l'image postgresql et l'image postgis
Enlever un conteneur 

pour se connecter au conteneur à partir de l'exterrieur 

```
psql -h localhost -U postgres -p 5432 
```
Le mot de passe étant celui passé utilisé lors de la création de l'image
```
docker rm -f
```

Voir les conteneurs actifs

```
docker ps -a 
```

Lancer un bash dans un containeur à partir de son nom
```
docker exec -it postgres-0 bash
```