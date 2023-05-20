/// <reference types='leaflet-sidebar-v2' />
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { Map, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, geoJson, LeafletMouseEvent } from 'leaflet';
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
			<p>
				Statistiques ici
        {{stats | json}}
			</p>
		</ng-template>
	</li>
	<li [ngbNavItem]="2">
		<button ngbNavLink>Infographies</button>
		<ng-template ngbNavContent>
    <div class="offcanvas-header">
    <h5 class="offcanvas-title">{{nom}}</h5>
    <button
      type="button"
      class="btn-close text-reset"
      aria-label="Close"
      (click)="activeOffcanvas.dismiss('Cross click')"
    ></button>
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
<pre>Active: {{ active }}</pre>
	`
})

export class NgbdOffcanvasContent {
  @Input() analyses: Analyse[] = [];
  @Input() nom: string = ""
  @Input() active: number = 2
  @Input() stats: object | undefined
  constructor(public activeOffcanvas: NgbActiveOffcanvas) { }
}
@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css'],
})

export class OsmMapComponent implements OnInit, OnDestroy {
  geojsonIRIS = geoJSON()
  geojsonCommune = geoJSON()
  geojsonIntercommune = geoJSON()
  geojsonDepartement = geoJSON()
  choroplethView: "None" | "nombre_vente_maisons" | "nombre_vente_appartements" | "prix_m2_median_maisons" | "prix_m2_median_appartements" = "None"
  activeLayerName = "departement"
  activeLayer = geoJSON()
  defaultStyle = { "weight": 1, "opacity": 0.3, "fillOpacity": 0 };
  hoverStyle = { "weight": 2, "opacity": 0.9, "fillOpacity": 0.3 };
  defaultStyleChorolopeth = { "weight": 1  , "fillOpacity" : 0.5,  "color" : "#FFFFFF"};
  hoverStyleChorolopeth = { "weight": 5 , "fillOpacity" : 0.6, "color" : "#B80000"  };
  map!: Map;
  zoom!: number;
  layers: Layer[] = []
  layersControl: any
  analyses!: Analyse[]
  myLayers: { [name: string]: GeoJSON } = {}
  legend!: Legend
  descriptionsLegend : { [name: string]: string } = {
    nombre_vente_maisons: "Nombre de ventes de maisons",
    nombre_vente_appartements: "Nombre de ventes d'appartements",
    prix_m2_median_maisons: "Prix médian du m2 des maisons en EURO",
    prix_m2_median_appartements: "Prix médian du m2 des appartements en EURO"
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
        console.info("fermé")
      })
      offcanvasRef.dismissed.subscribe((valuedissmissed) => {
        console.info("dissmised")
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
  private initDepartement(http: HttpClientODS) {
    http.getDepartement().subscribe(response => {
      response.forEach((value) => {
        this.postresql.getVenteDepartement().subscribe((dataVente) => {
          this.postresql.getPrixMedianDepartement().subscribe((dataPrixMedian) => {
            this.postresql.getStatsDepartement().subscribe((stats) => {
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = "La Réunion";
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson);
              myGeoJson.setStyle(this.defaultStyle);
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseDepartement)
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
              this.myLayers['departement'].addLayer(this.basicStyle(myGeoJson))
              console.log(this.myLayers['departement'])
            })
          })
        })
      })
    })
  }
  private initEpciTiles(http: HttpClientODS) {
    http.getEPCI().subscribe(response => {
      response.forEach((value) => {
        let epciCode = value["epci_code"][0];
        this.postresql.getVenteEpci(epciCode).subscribe((dataVente) => {
          this.postresql.getPrixMedianEpci(epciCode).subscribe((dataPrixMedian) => {
            this.postresql.getStatsEpci(epciCode).subscribe((stats) => {
              let epciName = value["epci_name"]
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = epciName;
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson)
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseParEpci)
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
              this.myLayers['intercommune'].addLayer(this.basicStyle(myGeoJson))
            })
          })
        })
      })
    });
  }

  private initCommunesTiles(http: HttpClientODS) {
    http.getCommunes().subscribe(response => {
      response.forEach((value) => {
        let communeCode = value["com_code"][0];
        this.postresql.getVenteCommune(communeCode).subscribe((dataVente) => {
          this.postresql.getPrixMedianCommune(communeCode).subscribe((dataPrixMedian) => {
            this.postresql.getStatsCommune(communeCode).subscribe((stats) => {
              let nomCommune = value["com_name"][0];
              let geometrie = value["geo_shape"];
              let myJson = JSON.parse(JSON.stringify(geometrie))
              let myGeoJson;
              myJson["properties"]["vente"] = dataVente;
              myJson["properties"]["prix_median"] = dataPrixMedian;
              myJson["properties"]["nom"] = nomCommune;
              myJson["properties"]["stats"] = stats;
              myGeoJson = geoJSON(myJson)
              let createdHandler = this.getAnalyseOnClick(this.postresql.getAnalyseParCommune)
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
              this.myLayers['commune'].addLayer(this.basicStyle(myGeoJson))
            }, (e: Error) => { console.error(e) }, () => { console.info("fin getStatsCommune") })
          }, (e: Error) => { console.error(e) }, () => { console.info("fin getPrixMedianCommune") })
        }, (e: Error) => { console.error(e) }, () => { console.info("fin getVenteCommune") })
      })
    }, (e: Error) => { console.error(e) });
  }

  private initIRIS(http: HttpClientODS) {
    http.getIRIS().subscribe(response => {
      response.forEach((value) => {
        let nomIRIS = value["iris_name"];
        let geometrie = value["geo_shape"];
        let myjson = JSON.parse(JSON.stringify(geometrie));
        myjson["properties"]["nom"] = nomIRIS;
        let mygeoJSON = geoJSON(myjson)
        this.myLayers['iris'].addLayer(this.basicStyle(mygeoJSON))
      })
      let createdHandler = this.getAnalyseOnClick(this.postresql.getanalyseIRIS)
      this.myLayers['iris'].getLayers().forEach((layer) => { layer.on("click", (_e: LeafletMouseEvent) => {createdHandler(_e) }) })
    })
  }
  public setActiveLayerDepartement() {
    this.map.removeLayer(this.activeLayer)
    this.activeLayer = this.geojsonDepartement
    this.map.addLayer(this.activeLayer)
  }
  // -----------------------basic styler-----------------------------
  public basicStyle(x: GeoJSON) {
    x.setStyle(this.defaultStyle)
    x.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) })
    x.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) })
    return x
  }
  public basicStyleChorolopeth(x: GeoJSON) {
    x.setStyle(this.defaultStyle)
    x.on('mouseover', (e) => { e.target.setStyle(this.hoverStyleChorolopeth) })
    x.on('mouseout', (e) => { e.target.setStyle(this.defaultStyleChorolopeth) })
    return x
  }
  // -----------------------layer handler-----------------------------

  public getAnalyseOnClick(analyser: (data: { vente: object; prix_median: object }, nom: string) => Analyse[]) {
    return (_e: LeafletMouseEvent) => {
      this.analyses.forEach((analyse) => { analyse.destroyView() })
      this.analyses = analyser({ "vente": _e.sourceTarget.feature.properties.vente, "prix_median": _e.sourceTarget.feature.properties.prix_median }, _e.sourceTarget.feature.properties.nom)
      this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
    }
  }
  
  setChloroplethView(view: "nombre_vente_maisons" | "nombre_vente_appartements" | "prix_m2_median_maisons" | "prix_m2_median_appartements") {
    let tmp = this.activeLayerName;
    this.choroplethView = this.choroplethView == view ? "None" : view;
    console.log(this.choroplethView)
    this.removeCurrentLayer()
    this.setActiveLayer(tmp);
  }

  removeCurrentLayer() {
    this.activeLayerName = "None";
    this.map.removeLayer(this.activeLayer)
  }


  // A réecrire
  setActiveLayer(layername: string) {
    this.map.removeLayer(this.activeLayer)
    if (this.activeLayerName == layername) {
      this.activeLayerName = "None"
    } else {
      this.activeLayerName = layername
      if (this.choroplethView != "None" && layername != "departement" ) {
        this.legend = new Legend(layername,this.descriptionsLegend[this.choroplethView],this.myLayers[layername], this.choroplethView)
        let createdHandler = this.findHandler(layername)
        this.activeLayer = geoJson(this.myLayers[layername].toGeoJSON(), { style: this.legend.getStyler() })
        this.activeLayer.getLayers().forEach((layer) => {
          layer.on('mouseover', (e) => { e.target.setStyle(this.hoverStyleChorolopeth) })
          layer.on('mouseout', (e) => { e.target.setStyle(this.defaultStyleChorolopeth) })
        })
        this.activeLayer.on("click", (_e: LeafletMouseEvent) => { createdHandler(_e) })
      } else {
        this.activeLayer = this.myLayers[layername]
      }
    }
    this.map.addLayer(this.activeLayer)
  }

  findHandler(layername: string) : (_e: LeafletMouseEvent) => void {
    let handler : (_e: LeafletMouseEvent) => void = (_e: LeafletMouseEvent) => {}
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
    }
    return handler
  }
}