const Pool = require("pg").Pool;
let pool;

if (process.env.DATABASE_URL) {
  console.info("Utilisation de la base de données attachées \n");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  console.info("--MODE DEV--\nUtilisation de la base de données local \n");
  pool = new Pool({
    connectionString: "postgres://ismael:sagrandmere@localhost:5432/dvf",
  });
}

const natureMutationGlobal = (request, response) => {
  console.info("Compte type mutation global");
  pool.query(
    `WITH total_mutations AS (SELECT COUNT(*) FROM dvf.mutation)
    SELECT 
      libnatmut,
      COUNT(*) AS nombre_de_mutation,
      ROUND(COUNT(*) * 100.0 / (SELECT * FROM total_mutations),2) AS pourcentage
    FROM 
      dvf.mutation
    GROUP BY 
      libnatmut
    ORDER BY 
      nombre_de_mutation ASC;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const venteAnneeGlobal = (request, response) => {
  /**
   * Cette fonction permet de récupérer les chiffres associées aux ventes
   * par année à l'échelle de la Réunion
   */
  console.info("Compte type mutation global");
  pool.query(
    `SELECT COUNT(*) as nombre_ventes, anneemut
    FROM 
      dvf.dvf.mutation
    GROUP BY 
      anneemut
    ORDER BY 
      anneemut ASC;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const typeLocalGlobal = (request, response) => {
  /**
   * Cette fonction permet de récupérer les types de locaux
   * con
   */
  console.info("Compte type mutation global");
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
    GROUP BY 
      anneemut
    ORDER BY 
      anneemut ASC;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  natureMutationGlobal,
  typeLocalGlobal,
  venteAnneeGlobal
};
