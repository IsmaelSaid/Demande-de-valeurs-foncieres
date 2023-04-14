
export const CONFIG = {
    titre: "DVF mode production",
    localisationReunion : [-21.12793576632045, 55.53617714019368],
    tiles : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution : '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    zoom : 11,
    maxZoom : 15,
    minzoom : 3, 
    urlOpenDataSoft: "https://data.regionreunion.com/api/v2/catalog/datasets/",
    communesDatasetID: "communes-millesime-france/",
    epciDatasetID : "intercommunalites-millesime-france/",
    irisDatasetAssets:"/assets/iris-millesime-la-reunion.json",
    countMutationsEnpoint:"api/count/mutations/",
    countTypeLocalEndpoint:"api/count/typelocal/",
    apiGlobalVente : "api/global/vente/",
    apiGlobalTypeLocalVenduParCommune : "api/global/type_local_vendu_par_commune/",
    apiGlobalEvolutionPrixParTypeLocal :"api/global/evolution_prix_par_type_local/",
    apiGlobalprixMedianMaisonAppartement:"api/global/prix_median_maison_appartement/"
 };