# Guide exploitation demande de valeurs foncière + open **data**

Arrếter un service postgres 
```
sudo service postgresql stop
```

reprendre l'execution d'un service postgres

```
sudo service postgresql start
```


## Commande postgresql
Se connecter à l'interface administrateur de postgres
sudo -i -u postgres

Utiliser l'extension postgis
```
CREATE EXTENSION postgis;
```

Vérifier la présence de l'extension postgis
```
SELECT PostGIS_full_version();
```

Creer une base d
```
psql -h localhost -p 5432 -U postgres -d nombase -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;"
```

```
psql -h localhost -p 5432 -U ismael -d dvf -f dvf_initial.sql
psql -h localhost -p 5432 -U ismael -d dvf -f dvf_departements.sql
```
afficher toute les relations 
```
\dt *.*
```
Les bases contenus dans le dump sql correspondent aux tables ici :
http://doc-datafoncier.cerema.fr/dv3f/doc/


# Requêtes

**1-Comptez le nombre de mutation au total.** 
```
SELECT count(*) as nombre_de_mutations
from dvf.mutation
```
**2-Retrouvez les mutations concernant des Ventes uniquement.**
```
SELECT * 
FROM dvf.mutation
WHERE libnatmut = 'Vente'
LIMIT 5;
```


**3-Calculez la proportion de mutation concernant des ventes:** 

```
SELECT 
COUNT(*) * 100 / (SELECT COUNT(*) FROM dvf.mutation) AS pourcentage
FROM dvf.mutation
WHERE libnatmut = 'Vente';
```

**4-Calculez le nombre de mutation pour chaque type de mutation** 
- Adjudication, 
- Echange
- Expropriation
- Vente
- Ventre à l'état futur d'achevement
- Vente terrain à batir

```
SELECT libnatmut,COUNT(*) AS nombre_de_mutation
FROM dvf.mutation
GROUP BY libnatmut
ORDER BY nombre_de_mutation ASC;
```

**Calculez le pourcentage de chacune des types de mutations**

```
WITH total_mutations AS (
  SELECT COUNT(*) FROM dvf.mutation
)
SELECT 
    libnatmut,
    COUNT(*) AS nombre_de_mutation,
    ROUND(COUNT(*) * 100.0 / (SELECT * FROM total_mutations),2) AS pourcentage
FROM 
    dvf.mutation
GROUP BY 
    libnatmut
ORDER BY 
    nombre_de_mutation ASC;
```

**Comptez le nombre de type de bien**

```
SELECT COUNT(*) as nombre, libtypbien
FROM 
    dvf.mutation
GROUP BY 
    libtypbien
ORDER by 
    nombre ASC

```

**Comptez le nombre total de locaux ayant mutés**

```
SELECT sum(nblocmut) as nombre_de_locaux
FROM dvf.mutation

```

**Dénonbrez le nombre de locaux ayant muté en fonction de la forme physique**

```
SELECT 
    sum(nblocmut) as nombre_de_locaux,
    sum(nblocmai) as nombre_de_maisons,
    sum(nblocapt) as nombre_d_appartements,
    sum(nblocmai + nblocapt) as nombre_de_logements,
    sum(nblocdep) as nombre_de_dependance,
    sum(nblocact) as nombre_de_locaux_activites
FROM dvf.mutation
```

**Dénombrez le nombre d'apprtement de moin de deux pièces**

```
SELECT sum(nbapt1pp + nbapt2pp) as nombre_appartement_moins_de_3_pieces
FROM dvf.mutation
```
**Selectionnez l'ensemble des mutations concernant Sainte-Marie**

```
select * from
DVF.mutation
where '97418' = any(l_codinsee)
```

**Retrouvez le système de projection dans lequel les données géométriques sont exprimées**
```
SELECT ST_SRID(geomparmut) FROM dvf.mutation LIMIT 1
```

**Convertissez les géométries des parcelles mutées dans un système de projection pour leaflet**
```
SELECT st_asgeojson(st_transform(geomparmut,4326))
FROM DVF.mutation
WHERE geomparmut IS NOT NULL
LIMIT 5;
```
