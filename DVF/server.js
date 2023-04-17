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

// TODO: 
app.get('/api/commune/nature_mutation/:codeinsee',db_local.natureMutationCommune)
app.get('/api/commune/vente/:codeinsee',db_local.venteAnneeCommune)
app.get('/api/commune/type_local/:codeinsee',db_local.typeLocalCommune)

// Calcul du nombre de maisons/appartement vendu sur une commune par année (Stacked Barplot)
app.get('/api/commune/type_local_vendu_par_commune_par_annee/:codeinsee',db_local.typeLocalVenduParCommuneParAnnee)

// // Calcul du prix au m2 des maisons/appartement sur une commune par année (Lineplot)
app.get('/api/commune/evolution_prix_par_type_local/:codeinsee',db_local.evolutionPrixParTypeLocalCommune)

// // Calcul du prix median des maisons/appartement à l'échelle d'une commune (Barplot ou indicateurs unique)
app.get('/api/commune/prix_median_maison_appartement/:codeinsee',db_local.prixMedianMaisonAppartementCommune)
// -------------------------------------------------------------------------------------------------------------------------

app.get('/api/global/nature_mutation/',db_global.natureMutationGlobal)
app.get('/api/global/vente/',db_global.venteAnneeGlobal)

app.get('/api/global/type_local/',db_global.typeLocalGlobal)

// Calcul du nombre de maisons/appartement vendu par commune  (Barplot)
app.get('/api/global/type_local_vendu_par_commune/',db_global.typeLocalVenduParCommune)

// Calcul du prix au m2 des maisons/appartement à l'échelle de la Réunion par années (Lineplot)
app.get('/api/global/evolution_prix_par_type_local/',db_global.evolutionPrixParTypeLocal)

// Calcul du prix median des maisons/appartement à l'échelle de la Réunion (Barplot ou indicateurs unique)
app.get('/api/global/prix_median_maison_appartement/',db_global.prixMedianMaisonAppartement)

app.listen(process.env.PORT || 8080);