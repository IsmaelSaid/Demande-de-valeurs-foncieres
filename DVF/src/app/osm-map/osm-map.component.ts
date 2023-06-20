/// <reference types='leaflet-sidebar-v2' />
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { Map, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, geoJson, LeafletMouseEvent, popup } from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import 'leaflet.markercluster';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { Analyse } from '../models/analyse.model';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CanvasModule } from '../canvas/canvas.module';
import { CommonModule } from '@angular/common';
import { GeoJSON } from 'leaflet';
import { Legend } from '../models/legend.model';
import * as _ from 'lodash';

@Component({
  selector: 'ngbd-offcanvas-content',
  standalone: true,
  imports: [CanvasModule, NgbNavModule, CommonModule],
  template: `
  <ul ngbNav #nav="ngbNav" [(activeId)]="active" class="nav-tabs">
	<li [ngbNavItem]="1">
		<button ngbNavLink>Statistiques</button>
		<ng-template ngbNavContent>
    <h5 class="offcanvas-title">{{nom}}</h5>
			<p *ngIf="stats">
        Prix médian du m<sup>2</sup> des maisons : {{stats['nombre_vente_maisons'] < 3 ? "pas assez de données": stats['prix_m2_median_maisons'] | currency : 'EUR'}} <br>
        Prix médian du m<sup>2</sup> des appartements : {{stats['nombre_vente_appartements'] < 3 ? "pas assez de données" : stats['prix_m2_median_appartements'] | currency : 'EUR'}} <br>
        nombre de maisons vendues : {{stats['nombre_vente_maisons'] ? stats['nombre_vente_maisons'] : 0}}  <br>
        nombre d'appartements vendus : {{stats['nombre_vente_appartements'] ? stats['nombre_vente_appartements'] : 0}}
			</p>
		</ng-template>
	</li>
	<li [ngbNavItem]="2">
		<button ngbNavLink>Infographies</button>
		<ng-template ngbNavContent>
    <h5 class="offcanvas-title">{{nom}}</h5>
    <div class="offcanvas-header">
   
  </div>
  <div class="offcanvas-body">
  <div id="analyse"></div>
  <app-analyse-multiple [analyses]="analyses">
  </app-analyse-multiple>
  </div>
		</ng-template>
	</li>
</ul>
<div [ngbNavOutlet]="nav" class="mt-2"></div>
	`
})

export class NgbdOffcanvasContent {
  @Input() analyses: Analyse[] = [];
  @Input() nom: string = ""
  @Input() active: number = 2
  @Input() stats: {[key:string] : number} | undefined
  constructor(public activeOffcanvas: NgbActiveOffcanvas) {
    // console.log(this.stats)
  }
}
@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css'],
})

export class OsmMapComponent implements OnInit, OnDestroy {
  choroplethView: "None" | "nombre_vente_maisons" | "nombre_vente_appartements" | "prix_m2_median_maisons" | "prix_m2_median_appartements" = "None"


  activeLayer = geoJSON() // geojson qui permet d'indiquer la couche active
  geojsonIRIS = geoJSON() // Creates a geojson object for IRIS data
  geojsonCommune = geoJSON() // Creates a geojson object for commune data
  geojsonIntercommune = geoJSON() // Creates a geojson object for intercommune data
  geojsonDepartement = geoJSON() // Creates a geojson object for departement data


  // Quelques constantes
  defaultStyle = { "weight": 1, "opacity": 0.3, "fillOpacity": 0 };
  hoverStyle = { "weight": 2, "opacity": 0.9, "fillOpacity": 0.3 };
  defaultStyleChorolopeth = { "weight": 1, "fillOpacity": 0.5, "color": "#FFFFFF" };
  hoverStyleChorolopeth = { "weight": 5, "fillOpacity": 0.6, "color": "#B80000" };
  popupOption = { className: "leafletpopup", closeButton: false }

  // On utilise le la couche departement comme couche active par défaut
  activeLayerName = "departement"


  map!: Map;
  zoom!: number;
  layers: Layer[] = []
  layersControl: any
  analyses!: Analyse[]
  myLayers: { [name: string]: GeoJSON } = {}
  legend!: Legend | undefined
  descriptionsLegend: { [name: string]: string } = {
    nombre_vente_maisons: "Les ventes de maisons",
    nombre_vente_appartements: "Les ventes d'appartements",
    prix_m2_median_maisons: "Prix médian des maisons",
    prix_m2_median_appartements: "Prix médian des appartements"
  }
  

  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Input() options: MapOptions = {
    layers: [tileLayer(CONFIG.tiles, {
      opacity: 1,
      maxZoom: CONFIG.maxZoom,
      attribution: CONFIG.attribution
    })],
    zoom: 10,
    center: latLng(latLng(CONFIG.localisationReunion[0], CONFIG.localisationReunion[1]))
  };
  constructor(private http: HttpClientODS, private postresql: PgsqlBack, private changeDetector: ChangeDetectorRef, private offcanvasService: NgbOffcanvas, private zone: NgZone) {
    this.analyses = []
  }
  open(data: Analyse[], stats: Object, nom: string) {
    this.zone.run(() => {
      let canvasOptions = {
        panelClass: "bg-custom text-white"
      }
      const offcanvasRef = this.offcanvasService.open(NgbdOffcanvasContent, canvasOptions);
      offcanvasRef.componentInstance.analyses = data;
      offcanvasRef.componentInstance.stats = stats;
      offcanvasRef.componentInstance.nom = nom;
      offcanvasRef.closed.subscribe((valueclosed) => {
      })
      offcanvasRef.dismissed.subscribe((valuedissmissed) => {
      })
    })
  }
  ngOnInit() {
    this.layersControl = { baseLayers: {}, overlays: {} }
    this.myLayers = {
      'departement': geoJSON(),
      'intercommune': geoJSON(),
      'commune': geoJSON(),
      'iris': geoJSON()
    }
    this.initCommunesTiles(this.http);
    this.initEpciTiles(this.http);
    this.initDepartement(this.http);
    this.initIRIS(this.http);
    this.activeLayer = this.myLayers["departement"]

    this.descriptionsLegend["nombre_vente_maisons"]
    this.descriptionsLegend["nombre_vente_appartements"]
    this.descriptionsLegend["prix_m2_median_maisons"]
    this.descriptionsLegend["prix_m2_median_appartements"]
  }
  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
  };
  onMapReady(map: Map) {
    this.map = map;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);
    this.map.addLayer(this.activeLayer)
  }
  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }
  /**
 * Initialise le département en effectuant des requêtes HTTP et en ajoutant la couche correspondante à la carte.
 *
 * @param http Le service HttpClientODS utilisé pour effectuer les requêtes HTTP.
 */
  private initDepartement(http: HttpClientODS) {
    // Effectuer une requête HTTP pour obtenir les données des départements
    http.getDepartement().subscribe(response => {
      response.forEach((value) => {
        // Effectuer une requête HTTP pour obtenir les données de vente du département
        this.postresql.getVenteDepartement().subscribe((dataVente) => {
          // Effectuer une requête HTTP pour obtenir les données de prix médian du département
          this.postresql.getPrixMedianDepartement().subscribe((dataPrixMedian) => {
            // Effectuer une requête HTTP pour obtenir les statistiques du département
            this.postresql.getStatsDepartement().subscribe((stats) => {
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;

              // Ajouter les données aux propriétés GeoJSON
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = "La Réunion";
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson);

              // Appliquer le style par défaut à la couche GeoJSON
              myGeoJson.setStyle(this.defaultStyle);

              // Configurer le gestionnaire d'événements pour les clics
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseDepartement)
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })

              // Ajouter la couche GeoJSON à la couche des départements avec le style de base
              this.myLayers['departement'].addLayer(this.basicStyle(myGeoJson))
            })
          })
        })
      })
    })
  }
  /**
 * Initialise les tuiles des EPCI (Établissement Public de Coopération Intercommunale) en effectuant des requêtes HTTP et en ajoutant les couches correspondantes à la carte.
 *
 * @param http Le service HttpClientODS utilisé pour effectuer les requêtes HTTP.
 */
  private initEpciTiles(http: HttpClientODS) {
    // Effectuer une requête HTTP pour obtenir les données des EPCI
    http.getEPCI().subscribe(response => {
      response.forEach((value) => {
        let epciCode = value["epci_code"][0];
        // Effectuer une requête HTTP pour obtenir les données de vente de l'EPCI

        this.postresql.getVenteEpci(epciCode).subscribe((dataVente) => {

          // Effectuer une requête HTTP pour obtenir les données de prix médian de l'EPCI
          this.postresql.getPrixMedianEpci(epciCode).subscribe((dataPrixMedian) => {
            // Effectuer une requête HTTP pour obtenir les statistiques de l'EPCI
            this.postresql.getStatsEpci(epciCode).subscribe((stats) => {
              let epciName = value["epci_name"]
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;

              // Ajouter les données aux propriétés GeoJSON
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = epciName;
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson)

              // Lier une fenêtre contextuelle à la couche GeoJSON
              myGeoJson.bindPopup("" + epciName, this.popupOption)
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseParEpci)
              // Configurer le gestionnaire d'événements pour les clics
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
              this.myLayers['intercommune'].addLayer(this.basicStyle(myGeoJson))
            })
          })
        })
      })
    });
  }
  /**
   * Initialise les tuiles des communes en effectuant des requêtes HTTP et en ajoutant les couches correspondantes à la carte.
   *
   * @param http Le service HttpClientODS utilisé pour effectuer les requêtes HTTP.
   */
  private initCommunesTiles(http: HttpClientODS) {
    // Effectuer une requête HTTP pour obtenir les données des communes

    http.getCommunes().subscribe(response => {
      response.forEach((value) => {
        let communeCode = value["com_code"][0];
        // Effectuer une requête HTTP pour obtenir les données de vente de la commune
        this.postresql.getVenteCommune(communeCode).subscribe((dataVente) => {
          // Effectuer une requête HTTP pour obtenir les données de prix médian de la commune
          this.postresql.getPrixMedianCommune(communeCode).subscribe((dataPrixMedian) => {
            // Effectuer une requête HTTP pour obtenir les statistiques de la commune
            this.postresql.getStatsCommune(communeCode).subscribe((stats) => {
              let nomCommune = value["com_name"];
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;

              // Ajouter les données aux propriétés GeoJSON
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = nomCommune;
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson)
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseParCommune)
              // Lier une fenêtre contextuelle à la couche GeoJSON
              myGeoJson.bindPopup("" + nomCommune, this.popupOption)

              // Configurer le gestionnaire d'événements pour les clics
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
              this.myLayers['commune'].addLayer(this.basicStyle(myGeoJson))
            }, (e: Error) => { console.error(e) }, () => {})
          }, (e: Error) => { console.error(e) }, () => {})
        }, (e: Error) => { console.error(e) }, () => {})
      })
    }, (e: Error) => { console.error(e) });
  }

  /**
   * 
 * Initialise les données IRIS
 *
 * @param http Le service HttpClientODS utilisé pour effectuer la requête HTTP.
 */
  private initIRIS(http: HttpClientODS) {
    http.getIRIS().subscribe(response => {
      response.forEach((value) => {
        let nomIRIS = value["iris_name"];
        let geometrie = value["geo_shape"];
        let myjson = JSON.parse(JSON.stringify(geometrie));
        myjson["properties"]["nom"] = nomIRIS;
        let mygeoJSON = geoJSON(myjson)
        this.myLayers['iris'].addLayer(this.basicStyle(mygeoJSON))
        mygeoJSON.bindPopup("" + nomIRIS, this.popupOption)
      })
      let createdHandler = this.getAnalyseOnClick(this.postresql.getanalyseIRIS)
      this.myLayers['iris'].getLayers().forEach((layer) => { layer.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) }) })
    })
  }

  /**
   * Applique le style de base à une couche et définit les gestionnaires d'événements pour les interactions avec la souris.
   *
   * @param x La couche à styliser.
   * @returns La couche avec le style appliqué et les gestionnaires d'événements définis.
   */
  public basicStyle(x: GeoJSON) {
    x.setStyle(this.defaultStyle)
    x.on('mouseover', (e) => {
      e.target.setStyle(this.hoverStyle);
      e.target.openPopup()
    })
    x.on('mouseout', (e) => {
      e.target.setStyle(this.defaultStyle);
      e.target.closePopup()
    })
    return x
  }
  /**
 * Applique le style de base à une couche choroplèthe et définit les gestionnaires d'événements pour les interactions avec la souris.
 *
 * @param x La couche choroplèthe à styliser.
 * @returns La couche choroplèthe avec le style appliqué et les gestionnaires d'événements définis.
 */

  // -----------------------layer handler-----------------------------

  /**
 * Renvoie une fonction gestionnaire d'événements qui effectue des analyses basées sur les données spécifiées et ouvre une vue d'analyse.
 *
 * @param analyser La fonction d'analyse à utiliser, prenant en compte les données de vente et de prix médian, ainsi que le nom de la fonction.
 * @returns Une fonction gestionnaire d'événements qui effectue les analyses et ouvre la vue d'analyse.
 */
  public getAnalyseOnClick(analyser: (data: { vente: object; prix_median: object }, nom: string) => Analyse[]) {
    return (_e: LeafletMouseEvent) => {
      /**
     * Détruit toutes les vues d'analyse existantes.
     */
      this.analyses.forEach((analyse) => { analyse.destroyView() })
      /**
     * Effectue les analyses en utilisant les données
     */
      this.analyses = analyser({ "vente": _e.sourceTarget.feature.properties.vente, "prix_median": _e.sourceTarget.feature.properties.prix_median }, _e.sourceTarget.feature.properties.nom)
      console.info( _e.sourceTarget)
      this.open(this.analyses, _e.sourceTarget.feature.properties.stats[0], _e.sourceTarget.feature.properties.nom);
    }
  }

  /**
 * Définit la vue choroplèthe spécifiée et effectue les actions correspondantes.
 *
 * @param view La vue choroplèthe à définir, pouvant prendre les valeurs :
 *             - "nombre_vente_maisons"
 *             - "nombre_vente_appartements"
 *             - "prix_m2_median_maisons"
 *             - "prix_m2_median_appartements"
 */
  setChloroplethView(view: "nombre_vente_maisons" | "nombre_vente_appartements" | "prix_m2_median_maisons" | "prix_m2_median_appartements") {
    let tmp = this.activeLayerName;
    this.choroplethView = this.choroplethView == view ? "None" : view;
    if (this.choroplethView == "None") {
      this.legend = undefined
    }
    this.removeCurrentLayer()
    this.setActiveLayer(tmp);
  }
  /**
 * Supprime la couche active actuelle de la carte.
 */
  removeCurrentLayer() {
    this.activeLayerName = "None";
    this.map.removeLayer(this.activeLayer)
  }
  /**
   * Active une couche spécifiée et effectue les actions correspondantes.
   *
   * @param layername Le nom de la couche à activer.
   */
  setActiveLayer(layername: string) {
    /**
  * Retire la couche active actuelle de la carte.
  */
    this.map.removeLayer(this.activeLayer)
    if (this.activeLayerName == layername) {
      /**
       * Réinitialise la légende.
       */
      this.legend = undefined
      this.removeCurrentLayer()
    } else {
      this.activeLayerName = layername
      if (this.choroplethView != "None" && layername != "departement") {
        /**
       * Crée une nouvelle instance de la classe Legend pour la couche active.
       */
        this.legend = new Legend(layername,
          this.descriptionsLegend[this.choroplethView],
          this.myLayers[layername], this.choroplethView,
          {
            prob: [0.2, 0.4, 0.6, 0.8],
            couleur: [
              '#961215',
              '#cb181d',
              '#fb6a4a',
              '#fcae91',
              '#fee5d9']
          })
        /**
       * Trouve le gestionnaire d'événements approprié en fonction du nom de la couche.
       */
        let createdHandler = this.findHandler(layername)
        /**
         * Crée une couche active en utilisant les données géographiques de la couche sélectionnée
         * et applique le style de la légende.
         */
        this.activeLayer = geoJson(this.myLayers[layername].toGeoJSON(), { style: this.legend.getStyler() })
        this.activeLayer.getLayers().forEach((layer) => {
          layer.on('mouseover', (e) => {
            // ... (actions à effectuer lors du survol de la souris)
            // Récupérer les données de la couche sur lequel la souris survole
            e.target.setStyle(this.hoverStyleChorolopeth)
            let nom = e.target.feature.properties.nom[0]
            let popup = ""
            let nbMaisonsVendues = e.target.feature.properties.stats[0].nombre_vente_maisons
            let nbAppartementsVendues = e.target.feature.properties.stats[0].nombre_vente_appartements
            let prixMedianMaisons = e.target.feature.properties.stats[0].prix_m2_median_maisons
            let prixMedianAppartements = e.target.feature.properties.stats[0].prix_m2_median_appartements

            // Vérifier si les données sont null et les remplacer par 0 si nécessaire
            nbMaisonsVendues = nbMaisonsVendues == null ? 0 : nbMaisonsVendues
            nbAppartementsVendues = nbAppartementsVendues == null ? 0 : nbAppartementsVendues
            prixMedianMaisons = nbMaisonsVendues < 3 ? "Pas assez de données" : prixMedianMaisons + "€"
            prixMedianAppartements = nbAppartementsVendues < 3 ? "Pas assez de données" : prixMedianAppartements + "€"
            switch (this.choroplethView) {
              // Formater les données pour l'affichage dans une popup
              case "nombre_vente_maisons":
                popup = '<div>' + nom + '<br>' + 'Maisons vendues: ' + nbMaisonsVendues + '<br>' + '</div>'
                break;
              case "nombre_vente_appartements":
                popup = '<div>' + nom + '<br>' + 'Appartements vendus: ' + nbAppartementsVendues + '<br>' + '</div>'
                break;
              case "prix_m2_median_maisons":
                popup = '<div>' + nom + '<br>' + 'Prix median du m<sup>2</sup> : ' + prixMedianMaisons + '<br>' + '</div>'
                break;
              case "prix_m2_median_appartements":
                popup = '<div>' + nom + '<br>' + 'Prix median du m<sup>2</sup> : ' + prixMedianAppartements + '<br>' + '</div>'
                break;

            }
            layer.bindPopup(popup, this.popupOption).openPopup()
          })
          // ... (actions à effectuer lors de la sortie de la souris)

          layer.on('mouseout', (e) => {
            e.target.setStyle(this.defaultStyleChorolopeth)
            layer.closePopup()
          })
        })
        this.activeLayer.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
        this.map.addLayer(this.activeLayer)
      } else {
        this.activeLayer = this.myLayers[layername]
        this.map.addLayer(this.activeLayer)
      }
    }
  }
  /**
 * Retourne une fonction de gestionnaire d'événements adaptée au nom de la couche spécifiée.
 *
 * @param layername Le nom de la couche pour laquelle trouver le gestionnaire d'événements.
 * @returns La fonction de gestionnaire d'événements adaptée.
 * @throws Une erreur si le nom de la couche n'est pas pris en charge.
 */
  findHandler(layername: string): (_e: LeafletMouseEvent) => void {
    let handler: (_e: LeafletMouseEvent) => void = (_e: LeafletMouseEvent) => { }
    switch (layername) {
      case "iris":
        handler = this.getAnalyseOnClick(this.postresql.getanalyseIRIS)
        break;
      case "commune":
        handler = this.getAnalyseOnClick(this.postresql.getAnalyseParCommune)
        break;
      case "intercommune":
        handler = this.getAnalyseOnClick(this.postresql.getAnalyseParEpci)
        break;
      case "departement":
        handler = this.getAnalyseOnClick(this.postresql.getAnalyseDepartement)
        break;
      default:
        throw new Error("Nom de couche non pris en charge.");
    }
    return handler
  }

}