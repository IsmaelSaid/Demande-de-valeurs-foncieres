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
 * Récupère les données concernant la nature des mutations dans la table "dvf.mutation" de la base de données PostgreSQL.
 * Les données sont regroupées par nature de mutation et renvoyées sous forme de tableau JSON contenant les informations suivantes :
 * - "libnatmut" : nature de la mutation (vente, échange, donation, etc.)
 * - "nombre_de_mutation" : nombre total de mutations pour cette nature de mutation
 * - "pourcentage" : pourcentage du nombre de mutations par rapport au nombre total de mutations dans la table "dvf.mutation"
 *
 * @param {Object} request - Objet représentant la requête HTTP reçue par le serveur.
 * @param {Object} response - Objet représentant la réponse HTTP à renvoyer au client.
 * @returns {void} - Cette fonction ne renvoie rien directement, mais utilise la méthode "response.status().json()" pour renvoyer les données au client.
 * @throws {Error} - Lance une erreur si la requête SQL échoue.
 */

const natureMutationGlobal = (request, response) => {
  console.info("natureMutationGlobal");
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

/**
 * Récupère les données concernant le nombre de ventes par année dans la table "dvf.dvf.mutation" de la base de données PostgreSQL.
 * Les données sont regroupées par année de mutation et renvoyées sous forme de tableau JSON contenant les informations suivantes :
 * - "nombre_ventes" : nombre total de ventes pour l'année concernée
 * - "anneemut" : année de mutation
 *
 * @param {Object} request - Objet représentant la requête HTTP reçue par le serveur.
 * @param {Object} response - Objet représentant la réponse HTTP à renvoyer au client.
 * @returns {void} - Cette fonction ne renvoie rien directement, mais utilise la méthode "response.status().json()" pour renvoyer les données au client.
 * @throws {Error} - Lance une erreur si la requête SQL échoue.
 */

const venteAnneeGlobal = (request, response) => {
  console.info("venteAnneeGlobal");
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

/**
 * Récupère les données concernant les types de locaux dans les mutations de la table "dvf.mutation" de la base de données PostgreSQL.
 * Les données sont regroupées par année de mutation et renvoyées sous forme de tableau JSON contenant les informations suivantes :
 * - "anneemut" : année de mutation
 * - "nombre_de_locaux" : nombre total de locaux
 * - "nombre_de_maisons" : nombre de maisons
 * - "nombre_d_appartements" : nombre d'appartements
 * - "nombre_de_logements" : nombre total de logements (maisons + appartements)
 * - "nombre_de_dependance" : nombre de dépendances
 * - "nombre_de_locaux_activites" : nombre de locaux d'activités
 *
 * @param {Object} request - Objet représentant la requête HTTP reçue par le serveur.
 * @param {Object} response - Objet représentant la réponse HTTP à renvoyer au client.
 * @returns {void} - Cette fonction ne renvoie rien directement, mais utilise la méthode "response.status().json()" pour renvoyer les données au client.
 * @throws {Error} - Lance une erreur si la requête SQL échoue.
 */

const typeLocalGlobal = (request, response) => {
  console.info("typeLocalGlobal");
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
