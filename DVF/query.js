const Pool = require("pg").Pool;
let pool;  

if(process.env.DATABASE_URL){
  console.info("Utilisation de la base de données attachées \n");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}else {
  console.info("Utilisation de la base de données local \n");
  pool = new Pool({
    connectionString: "postgres://ismael:sagrandmere@localhost:5432/dvf"
  });
}

const getCountMutations = (request, response) => {
  const codeinsee = request.params.codeinsee
  console.info("countmutation for : "+codeinsee)
  pool.query(
    `WITH total_mutations AS (
      SELECT COUNT(*) FROM dvf.mutation
      )
      SELECT 
      libnatmut,
      COUNT(*) AS nombre_de_mutation,
      ROUND(COUNT(*) * 100.0 / (SELECT * FROM total_mutations),2) AS pourcentage
      FROM 
      dvf.mutation
      WHERE 
      $1 = any(l_codinsee)
      GROUP BY 
      libnatmut
      ORDER BY 
      nombre_de_mutation ASC;`,[codeinsee],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getCountTypeLocal = (request, response) => {
  const codeinsee = request.params.codeinsee;
  console.info("counttypelocal for codeinsee : "+codeinsee)
  pool.query(
    `SELECT 
      anneemut,
      sum(nblocmut) as nombre_de_locaux,
      sum(nblocmai) as nombre_de_maisons,
      sum(nblocapt) as nombre_d_appartements,
      sum(nblocmai + nblocapt) as nombre_de_logements,
      sum(nblocdep) as nombre_de_dependance,
      sum(nblocact) as nombre_de_locaux_activites
    FROM 
      dvf.mutation
    WHERE 
      $1 = any(l_codinsee)
    GROUP BY 
      anneemut
    ORDER BY 
      anneemut ASC;`,
    [codeinsee],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};
module.exports = {
  getCountMutations,
  getCountTypeLocal
};
