//Install express server
const express = require('express');
const path = require('path');
const db_local = require('./queryCommune')
const db_global = require('./queryGlobal')
const db_intercommunale = require ('./queryIntercommunale')
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

app.get('/api/global/vente/',db_global.vente)
app.get('/api/global/prix_median/',db_global.prixMedian)

// -------------------------------------------------------------------------------------------------------------------------

app.get('/api/intercommunale/type_local_vendu_par_epci/:codeinseeepci',db_intercommunale.typeLocalVenduParEpciParAnnee)
app.get('/api/intercommunale/evolution_prix_par_type_local_epci/:codeinseeepci',db_intercommunale.evolutionPrixParTypeLocalEpci)

// -------------------------------------------------------------------------------------------------------------------------

app.get('/api/commune/vente/:codeinsee',db_local.vente)
app.get('/api/commune/prix_median/:codeinsee',db_local.prixMedian)





app.listen(process.env.PORT || 8080);