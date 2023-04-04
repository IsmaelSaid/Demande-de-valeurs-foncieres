const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'dvfpgsql.fly.dev',
  database: 'dvfrun',
  password: 'KmEMlADl3kFpPlZ',
  port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT COUNT(*) FROM dvf.mutation', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

module.exports = {
    getUsers
}