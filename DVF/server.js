//Install express server
const express = require('express');
const path = require('path');
const db_local = require('./queryCommune')
const db_global = require('./queryGlobal')
var bodyParser = require('body-parser')

const app = express();

app.use(express.static(__dirname + '/dist/dvf'));
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/dvf/index.html'));
});
app.get('/api/commune/nature_mutation/:codeinsee',db_local.natureMutationCommune)
app.get('/api/commune/vente/:codeinsee',db_local.venteAnneeCommune)
app.get('/api/commune/type_local/:codeinsee',db_local.typeLocalCommune)

app.get('/api/global/nature_mutation/',db_global.natureMutationGlobal)
app.get('/api/global/vente/',db_global.venteAnneeGlobal)
app.get('/api/global/type_local/',db_global.typeLocalGlobal)
app.get('/api/global/type_local_vendu_par_commune/',db_global.typeLocalVenduParCommune)
app.get('/api/global/evolution_prix_par_type_local/',db_global.evolutionPrixParTypeLocal)

app.listen(process.env.PORT || 8080);