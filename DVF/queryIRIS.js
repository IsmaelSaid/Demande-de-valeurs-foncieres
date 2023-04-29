const Pool = require("pg").Pool;

const getPool = () => {
  const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : "postgres://postgres:sagrandmere@localhost:5432/dvf";

  console.info(`Utilisation de la base de données : ${connectionString}\n`);
  return new Pool({
    connectionString,
  });
};

const pool = getPool();


const prixMedian = (request, response) => {
  const formeiris = JSON.stringify(request.body)
  console.info("prixMedian IRIS") 
  pool.query(
    `
    SELECT 
    anneemut,
    sum(nblocapt) as nb_vendu,
    concat('','Appartement') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nbcomm = 1
    AND anneemut != 2022
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON($1),4326),ST_TRANSFORM(geomlocmut,4326))
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
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON($1),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut
    `,
    [formeiris],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  prixMedian
};