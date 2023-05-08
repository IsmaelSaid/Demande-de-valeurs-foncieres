const Pool = require("pg").Pool;
const cinor = "249740119"
const cirest = "249740093"
const civis = "249740077"
const casud = "249740085";
const tco = "249740077" 

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

function mapper_epci(codeinseeepci){
  const cinor = "249740119"
  const cirest = "249740093"
  const civis = "249740077"
  const casud = "249740085";
  const tco = "249740101" ;
  let communes = []
  switch (codeinseeepci){
    case cinor:
      //Sainte Marie, Sainte Denis, Sainte Suzanne
      communes = ['97411','97418','97420'];
      break;
    case cirest:
      //Bras Panon, la plaine des palmistes, Saint andré, Saint benoit, Saint andré, Sainte Rose, Salazie
      communes = ['97402','97406','97409','97410','97419','97421'];
      break;
    case casud:
      //Entre Deux, Saint-Joseph, Saint-Philippe, Le tampon
      communes = ['97403','97412','97417','97422'];
      break;
    case civis:
      //Saint Louis, Cilaos, l'étang salé, les avirons, Petit île, Saint pierre, 
      communes = ['97414','97424','97416','97422','97414','97401'];
      break;
    case tco:
      communes = ['97407','97415','97423','97413'];
      break;
  }
  return communes
}

const prixMedian = (request, response) => {
    const codeinseeepci = request.params.codeinseeepci;
    console.info("Evolution prix epci: " + mapper_epci(codeinseeepci));
    pool.query(
      `SELECT 
      anneemut, 
      CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbatmai) AS NUMERIC(10,2)) as prix_m2_median,
      concat('','Maison') as Type
      FROM dvf.mutation
      WHERE libnatmut = 'Vente'
      AND nblocmai > 0
      AND anneemut != 2022
      AND nblocapt = 0
      and $1 && l_codinsee
      GROUP BY anneemut
      UNION
      SELECT 
          anneemut, 
          CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbati) AS NUMERIC(10,2)) as prix_m2_median,
          concat('','Appartement') as Type
      FROM dvf.mutation
      WHERE libnatmut = 'Vente'
      AND nblocmai = 0
      AND anneemut != 2022
      AND nblocapt > 0
      AND sbatapt > 0
      and $1 && l_codinsee
      GROUP BY anneemut
      ORDER BY anneemut ASC`,
      [mapper_epci(codeinseeepci)],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };

  const vente = (request, response) => {
    const codeinseeepci = request.params.codeinseeepci;
    console.info("Type local vendu par epci : " + mapper_epci(codeinseeepci));
    pool.query(
      `SELECT 
      anneemut,
      sum(nblocapt) as nb_vendu,
      concat('','Appartement') as Type
      FROM dvf.mutation
      WHERE libnatmut = 'Vente'
      AND $1 && l_codinsee
      AND nbcomm = 1
      AND anneemut != 2022
      GROUP BY anneemut
  UNION
  SELECT 
      anneemut,
      sum(nblocmai) as nb_vendu,
      concat('','Maison') as Type
      FROM dvf.mutation
      WHERE libnatmut = 'Vente'
      AND nbcomm = 1
      AND anneemut != 2022
      AND $1 && l_codinsee
      GROUP BY anneemut`,
      [mapper_epci(codeinseeepci)],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };

  const stats = (request, response) => {
    const codeinseeepci = request.params.codeinseeepci;
    console.info("Type local vendu par commune et par année : " + codeinseeepci);
    pool.query(
      `WITH stats_maisons AS( 
        SELECT 
        CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbatmai) AS NUMERIC(10,2)) as prix_m2_median_maisons,
        COUNT(*) as nombre_vente_maisons
        FROM dvf.mutation
        WHERE libnatmut = 'Vente'
        AND nblocmai > 0
        AND anneemut != 2022
        AND nblocapt = 0
        AND $1 && l_codinsee
      ),stats_appartements AS (
        SELECT 
        CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeurfonc/sbati) AS NUMERIC(10,2)) as prix_m2_median_appartements,
        COUNT(*) as nombre_vente_appartements
        FROM dvf.mutation
        WHERE libnatmut = 'Vente'
        AND nblocmai = 0
        AND anneemut != 2022
        AND nblocapt > 0
        AND sbatapt > 0
        AND $1 && l_codinsee)
      select * 
      FROM stats_maisons FULL OUTER JOIN stats_appartements on TRUE`
    ,
      [mapper_epci(codeinseeepci)],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };
  
module.exports = {
    prixMedian,
    vente,
    stats
};
