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

**Dénombrez le nombre d'appartement vendus en fonction du nombre de pieces**
V1
```
SELECT 
    anneemut,
    sum(nbapt1pp) as apt1piece,
    sum(nbapt2pp) as apt2piece,
    sum(nbapt3pp) as apt3piece,
    sum(nbapt4pp) as apt4piece,
    sum(nbapt5pp) as apt5pieceplus
FROM dvf.mutation
group by anneemut
ORDER by anneemut ASC
```
V2
```
SELECT 
    anneemut,
    sum(nbapt1pp + nbapt2pp + nbapt3pp ) as app_max_3pp,
    sum(nbapt4pp + nbapt5pp) as app_min_4pp
FROM dvf.mutation
group by anneemut
ORDER by anneemut ASC
```
**Dénombrez le nombre de maison vendu par année en fonction du nombre de piece**

v1
```
SELECT 
    anneemut,
    sum(nbmai1pp) as nbmai1piece,
    sum(nbmai2pp) as nbmai2piece,
    sum(nbmai3pp) as nbmai3piece,
    sum(nbmai4pp) as nbmai4piece,
    sum(nbmai5pp) as nbmai5pieceplus
FROM dvf.mutation
group by anneemut
ORDER by anneemut ASC

```

v2
```
SELECT 
    anneemut,
    sum(nbmai1pp + nbmai2pp + nbmai3pp) as max_3pp,
    sum(nbmai4pp + nbmai5pp) as min_4pp
FROM dvf.mutation
where libnatmut = 'Vente'
group by anneemut
ORDER by anneemut ASC
```
**Retrouvez le nombre de maison muté sur les communes (Eliminez les mutations concernant à la fois plusieurs communes)**

```
SELECT 
    l_codinsee,
    sum(nblocmai) as nombre_de_maisons
FROM dvf.mutation
where libnatmut = 'Vente'
and nbcomm = 1
group by l_codinsee
order by nombre_de_maisons
```

**Calculez le prix des maisons au m² par année à l'échelle de la Réunion**
quel enfer

```
select anneemut, round(AVG(valeurfonc/sbatmai),2) as prix_m2_moyen
from 
dvf.mutation
where libnatmut = 'Vente'
and
nblocmai > 0
and nblocapt = 0
group by anneemut
order by anneemut ASC
limit 100
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

**Pieplot vega**
select 
    anneemut,
    sum(nblocapt) as nombre,
    concat('','Appartement') as type
from dvf.mutation
group by anneemut
UNION
select 
    anneemut,
    sum(nblocmai) as nombre,
    concat('','Maison') as Type
from dvf.mutation
group by anneemut
ORDER by anneemut ASC
**vega stacked**
SELECT 
    l_codinsee,
    sum(nblocapt) as nb_vendu,
    concat('','Appartement') as Type
FROM dvf.mutation
where libnatmut = 'Vente'
and nbcomm = 1
group by l_codinsee
union
SELECT 
    l_codinsee,
    sum(nblocmai) as nb_vendu,
    concat('','Maison') as Type
FROM dvf.mutation
where libnatmut = 'Vente'
and nbcomm = 1
group by l_codinsee


****
SELECT 
    anneemut, 
    CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbatmai) AS NUMERIC(10,2)) as prix_m2_median,
    concat('','Maison') as Type
FROM dvf.mutation
WHERE libnatmut = 'Vente'
AND nblocmai > 0
AND nblocapt = 0
GROUP BY anneemut
UNION
SELECT 
    anneemut, 
    CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbati) AS NUMERIC(10,2)) as prix_m2_median,
    concat('','Appartement') as Type
FROM dvf.mutation
WHERE libnatmut = 'Vente'
AND nblocmai = 0
AND nblocapt > 1
AND sbatapt > 0
GROUP BY anneemut
ORDER BY anneemut ASC