const { config } = require('dotenv')
const Pool = require('pg').Pool
config()
let pool = new Pool(); 
if(process.env.NODE_ENV == 'development'){
  pool = new Pool({
    "connectionString":process.env.DATABASE_LOCAL_URL
  })
}else{
  pool = new Pool({
    "connectionString":process.env.DATABASE_URL
  })
}


const getCountMutations = (request, response) => {
    pool.query('SELECT COUNT(*) FROM dvf.mutation', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  module.exports = {
    getCountMutations
  }


