//Install express server
const express = require('express');
const path = require('path');
const db_local = require('./queryCommune')
const db_global = require('./queryGlobal')
const db_iris = require('./queryIRIS')
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
app.get('/api/global/stats/',db_global.stats)


// -------------------------------------------------------------------------------------------------------------------------

app.get('/api/intercommunale/vente/:codeinseeepci',db_intercommunale.vente)
app.get('/api/intercommunale/prix_median/:codeinseeepci',db_intercommunale.prixMedian)
app.get('/api/intercommunale/stats/:codeinseeepci',db_intercommunale.stats)

// -------------------------------------------------------------------------------------------------------------------------

app.get('/api/commune/vente/:codeinsee',db_local.vente)
app.get('/api/commune/prix_median/:codeinsee',db_local.prixMedian)
app.get('/api/commune/stats/:codeinsee',db_local.stats)

//--------------------------------------------------------------------------------------------------------------------------

app.post('/api/iris/vente/',db_iris.prixMedian)

app.listen(process.env.PORT || 8080);