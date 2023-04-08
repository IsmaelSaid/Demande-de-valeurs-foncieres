const Pool = require("pg").Pool;

const getPool = () => {
  const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : "postgres://ismael:sagrandmere@localhost:5432/dvf";

  console.info(`Utilisation de la base de données : ${connectionString}\n`);
  return new Pool({
    connectionString,
  });
};

const pool = getPool();

/**
 * Récupère le nombre de mutations pour chaque nature de mutation (vente, donation, etc.)
 * pour une commune spécifique identifiée par son code INSEE.
 *
 * @param {Object} request - Requête HTTP reçue par le serveur
 * @param {Object} response - Réponse HTTP à renvoyer au client
 * @returns {void}
 */
const natureMutationCommune = (request, response) => {
  const codeinsee = request.params.codeinsee
  console.info("natureMutationCommune : "+codeinsee)
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


/**
 * Renvoie les statistiques sur les types de locaux pour une commune donnée.
 * 
 * @param {Object} request - L'objet représentant la requête HTTP reçue.
 * @param {Object} response - L'objet représentant la réponse HTTP à renvoyer.
 * @returns {void}
 * 
 * @throws {Error} Lance une erreur si une erreur SQL se produit.
 * 
 * @example
 * // Requête GET http://localhost:8080/api/type_local/vente/97418
 * typeLocalCommune(request, response);
 */
const typeLocalCommune = (request, response) => {
  const codeinsee = request.params.codeinsee;
  console.info("typeLocalCommune : "+codeinsee)
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

/**
 * Cette fonction récupère les chiffres associés aux ventes immobilières par année
 * pour une commune donnée.
 *
 * @param {Object} request - L'objet requête Express.
 * @param {Object} response - L'objet réponse Express.
 * @param {string} request.params.codeinsee - Le code INSEE de la commune.
 * @returns {Object} - L'objet réponse Express contenant les résultats de la requête.
 * @throws {error} - Une erreur est levée si la requête échoue.
 *
 * @example
 * // http://localhost:3000/api/commune/vente/97418
 * // Code INSEE de la commune de Sainte-Marie
 * 
*/

const venteAnneeCommune = (request, response) => {
  const codeinsee = request.params.codeinsee;
  console.info("venteAnneeCommune : "+codeinsee)
  pool.query(
    `SELECT COUNT(*) as nombre_ventes, anneemut
    FROM 
      dvf.mutation
    WHERE 
      $1 = any(l_codinsee)
    GROUP BY 
      anneemut
    ORDER BY 
      anneemut ASC;`,[codeinsee],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  natureMutationCommune,
  typeLocalCommune,
  venteAnneeCommune
};