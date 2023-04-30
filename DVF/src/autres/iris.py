import json
import psycopg2
import pandas as pd
conn = psycopg2.connect(
   database="dvf", user='postgres', password='sagrandmere', host='127.0.0.1', port= '5432'
)
query = '''
 SELECT 
    anneemut,
    sum(nblocapt) as nb_vendu,
    concat('','Appartement') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nbcomm = 1
    AND anneemut != 2022
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut
UNION
SELECT 
    anneemut,
    sum(nblocmai) as nb_vendu,
    concat('','Maison') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nbcomm = 1
    AND anneemut != 2022
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON(%s),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut;
'''
def geoshape_modifier(x):
    params = [str(x['geometry']),str(x['geometry'])]
    df = pd.read_sql(query, conn, params=params)
    x['properties'] = {"data" : df}
    return 1
    
f = open("../assets/iris-millesime-la-reunion.json")
iris_json = json.load(f)    
data = pd.DataFrame(iris_json)  
data["geo_shape"].apply(lambda x:geoshape_modifier(x))
data.to_json("../assets/custom_IRIS.json",orient="records")