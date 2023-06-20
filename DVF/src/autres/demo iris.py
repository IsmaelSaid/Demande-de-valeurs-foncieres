import json
import psycopg2
import pandas as pd
conn = psycopg2.connect(
    database="dvf", user='postgres', password='sagrandmere', host='127.0.0.1', port='5432'
)
query = '''
 SELECT 
    anneemut,
    sum(nblocapt) as nb_vendu,
    concat('','Appartement') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nblocmai = 0
    AND anneemut != 2022
    AND nblocapt > 0
    AND sbatapt > 0
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut
UNION
SELECT 
    anneemut,
    sum(nblocmai) as nb_vendu,
    concat('','Maison') as Type
    FROM dvf.mutation
    WHERE libnatmut = 'Vente'
    AND nblocmai > 0
    AND anneemut != 2022
    AND nblocapt = 0
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut;
'''
query2 = '''
 WITH stats_maisons AS( 
      SELECT 
        CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbatmai) AS NUMERIC(10,2)) as prix_m2_median_maisons,
      sum(nblocmai) as nombre_vente_maisons
      FROM dvf.mutation
        WHERE libnatmut = 'Vente'
        AND nblocmai > 0
        AND anneemut != 2022
        AND nblocapt = 0
        AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))
        ),
      stats_appartements AS (
        SELECT 
        CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbati) AS NUMERIC(10,2)) as prix_m2_median_appartements,
        sum(nblocapt) as nombre_vente_appartements
      FROM dvf.mutation
        WHERE libnatmut = 'Vente'
        AND nblocmai = 0
        AND anneemut != 2022
        AND nblocapt > 0
        AND sbatapt > 0
        AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))

              )
    select * 
    FROM stats_maisons FULL OUTER JOIN stats_appartements on TRUE
'''


def geoshape_modifier(x):
    params = [str(x['geometry']), str(x['geometry'])]
    # data = pd.read_sql(query, conn, params=params)
    stats = pd.read_sql(query2, conn, params=params)
    # print(stats)
    print(x['geometry'])
    # x['properties'] = {"data" : df}
    x['properties'] = {
        "vente": data,
        "stats": stats
    }
    return 1


f = open("../assets/iris-millesime-la-reunion.json")
iris_json = json.load(f)
data = pd.DataFrame(iris_json)
data["geo_shape"].apply(lambda x: geoshape_modifier(x))
# data.to_json("../assets/custom_IRIS.json",orient="records")
