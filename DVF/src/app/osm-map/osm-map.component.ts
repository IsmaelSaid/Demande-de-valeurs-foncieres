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
  choroplethView = 'None'
  activeLayer = "departement"
  al = this.geojsonDepartement
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  defaultStyle = { "weight": 1, "opacity": 0.3, "fillOpacity": 0 };
  hoverStyle = { "weight": 2, "opacity": 0.9, "fillOpacity": 0.3 };
  map!: Map;
  zoom!: number;
  layers: Layer[] = []
  layersControl: any
  analyses!: Analyse[]
  // Configurations de la caarte
  @Input() options: MapOptions = {
    layers: [tileLayer(CONFIG.tiles, {
      opacity: 1,
      maxZoom: CONFIG.maxZoom,
      // detectRetina: true,
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
    this.initCommunesTiles(this.http);
    this.initEpciTiles(this.http);
    this.initDepartement(this.http);
    this.initIRIS(this.http);
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
    this.map.addLayer(this.al)
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
              this.geojsonDepartement.addLayer(this.basicStyle(myGeoJson))
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { this.departementClickHandler(_e) })
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
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { this.intercommuneClickHandler(_e) })
              this.geojsonIntercommune.addLayer(this.basicStyle(myGeoJson))
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
              myGeoJson.on("click", (_e: LeafletMouseEvent) => { this.communeClickHandler(_e) })
              this.geojsonCommune.addLayer(this.basicStyle(myGeoJson))
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
        this.geojsonIRIS.addLayer(this.basicStyle(mygeoJSON))
      })
      this.geojsonIRIS.getLayers().forEach((layer) => { this.irisLayerClickHandler(layer) })
    })
  }

  // -----------------------Base layers-----------------------------
  public setActiveLayerIRIS() {
    this.map.removeLayer(this.al)
    let l;
    switch (this.choroplethView) {
      case "None":
        this.al = this.geojsonIRIS
        break;
      case "nombre_vente_maisons":
        l = new Legend("legend", this.geojsonIRIS, "nombre_vente_maisons")
        this.al = geoJson(this.geojsonIRIS.toGeoJSON(), { style: l.getStyler() })
        this.al.getLayers().forEach((layer) => { this.irisLayerClickHandler(layer) })
        break;
      case "nombre_vente_appartements":
        l = new Legend("legend", this.geojsonIRIS, "nombre_vente_appartements")
        this.al = geoJson(this.geojsonIRIS.toGeoJSON(), { style: l.getStyler() })
        this.al.getLayers().forEach((layer) => { this.irisLayerClickHandler(layer) })
        break;
      case "prix_m2_median_maisons":
        l = new Legend("legend", this.geojsonIRIS, "prix_m2_median_maisons")
        this.al = geoJson(this.geojsonIRIS.toGeoJSON(), { style: l.getStyler() })
        this.al.getLayers().forEach((layer) => { this.irisLayerClickHandler(layer) })
        break;
      case "prix_m2_median_appartements":
        l = new Legend("legend", this.geojsonIRIS, "prix_m2_median_appartements")
        this.al = geoJson(this.geojsonIRIS.toGeoJSON(), { style: l.getStyler() })
        this.al.getLayers().forEach((layer) => { this.irisLayerClickHandler(layer) })
        break;
    }
    this.map.addLayer(this.al)
  }
  public setActiveLayerCommune() {
    let l;
    this.map.removeLayer(this.al)
    switch (this.choroplethView) {
      case "None":
        this.al = this.geojsonCommune
        break;
      case "nombre_vente_maisons":
        l = new Legend("legend", this.geojsonCommune, "nombre_vente_maisons")
        this.al = geoJson(this.geojsonCommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.communeClickHandler(_e) })
        break;
      case "nombre_vente_appartements":
        l = new Legend("legend", this.geojsonCommune, "nombre_vente_appartements")
        this.al = geoJson(this.geojsonCommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.communeClickHandler(_e) })
        break;
      case "prix_m2_median_maisons":
        l = new Legend("legend", this.geojsonCommune, "prix_m2_median_maisons")
        this.al = geoJson(this.geojsonCommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.communeClickHandler(_e) })
        break;
      case "prix_m2_median_appartements":
        l = new Legend("legend", this.geojsonCommune, "prix_m2_median_appartements")
        this.al = geoJson(this.geojsonCommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.communeClickHandler(_e) })
        break;
    }
    this.map.addLayer(this.al)
  }
  public setActiveLayerIntercommune() {
    this.map.removeLayer(this.al)
    let l;
    switch (this.choroplethView) {
      case "None":
        this.al = this.geojsonIntercommune
        break;
      case "nombre_vente_maisons":
        l = new Legend("legend", this.geojsonIntercommune, "nombre_vente_maisons")
        this.al = geoJson(this.geojsonIntercommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.intercommuneClickHandler(_e) })
        break;
      case "nombre_vente_appartements":
        l = new Legend("legend", this.geojsonIntercommune, "nombre_vente_appartements")
        this.al = geoJson(this.geojsonIntercommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.intercommuneClickHandler(_e) })
        break;
      case "prix_m2_median_maisons":
        l = new Legend("legend", this.geojsonIntercommune, "prix_m2_median_maisons")
        this.al = geoJson(this.geojsonIntercommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.intercommuneClickHandler(_e) })
        break;
      case "prix_m2_median_appartements":
        l = new Legend("legend", this.geojsonIntercommune, "prix_m2_median_appartements")
        this.al = geoJson(this.geojsonIntercommune.toGeoJSON(), { style: l.getStyler() })
        this.al.on("click", (_e: LeafletMouseEvent) => { this.intercommuneClickHandler(_e) })
        break;
    }
    this.map.addLayer(this.al)
  }
  public setActiveLayerDepartement() {
    this.map.removeLayer(this.al)
    this.al = this.geojsonDepartement
    this.map.addLayer(this.al)
  }
  // -----------------------basic styler-----------------------------
  public basicStyle(x: GeoJSON) {
    x.setStyle(this.defaultStyle)
    x.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) })
    x.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) })
    return x
  }
  // -----------------------layer handler-----------------------------
  public irisLayerClickHandler(l: Layer) {
    l.on("click", (_e: LeafletMouseEvent) => {
      this.analyses.forEach((analyse) => { analyse.destroyView() })
      this.analyses = this.postresql.getanalyseIRIS({ "values": _e.sourceTarget.feature.properties.data }, _e.sourceTarget.feature.properties.nom)
      this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
      this.changeDetector.detectChanges()
    })
  }
  public departementClickHandler(_e: LeafletMouseEvent) {
    this.analyses.forEach((analyse) => { analyse.destroyView() })
    this.analyses = this.postresql.getAnalyseDepartement({ "vente": _e.sourceTarget.feature.properties.vente, "prix_median": _e.sourceTarget.feature.properties.prix_median }, _e.sourceTarget.feature.properties.nom)
    this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
  }

  public intercommuneClickHandler(_e: LeafletMouseEvent) {
    this.analyses.forEach((analyse) => { analyse.destroyView() })
    this.analyses = this.postresql.getAnalyseParEpci({ "vente": _e.sourceTarget.feature.properties.vente, "prix_median": _e.sourceTarget.feature.properties.prix_median }, _e.sourceTarget.feature.properties.nom)
    this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
  }

  public communeClickHandler(_e: LeafletMouseEvent) {
    this.analyses.forEach((analyse) => { analyse.destroyView() })
    this.analyses = this.postresql.getAnalyseParCommune({ "vente": _e.sourceTarget.feature.properties.vente, "prix_median": _e.sourceTarget.feature.properties.prix_median }, _e.sourceTarget.feature.properties.nom)
    this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
  }

  setChloroplethView(view: string) {
    let tmp = this.activeLayer;
    this.choroplethView = this.choroplethView == view ? "None" : view;
    this.removeCurrentLayer()
    this.setActiveLayer(tmp);
  }
  setActiveLayer(layerName: string) {
    switch (layerName) {
      case "iris":
        if (this.activeLayer == "iris") {
          this.activeLayer = "None"
          this.map.removeLayer(this.al)
        } else {
          this.activeLayer = layerName
          this.setActiveLayerIRIS()
        }
        break;
      case "commune":
        if (this.activeLayer == "commune") {
          this.activeLayer = "None"
          this.map.removeLayer(this.al)
        } else {
          this.activeLayer = layerName
          this.setActiveLayerCommune()
        }
        break;
      case "intercommune":
        if (this.activeLayer == "intercommune") {
          this.activeLayer = "None"
          this.map.removeLayer(this.al)
        } else {
          this.activeLayer = layerName
          this.setActiveLayerIntercommune()
        }
        break;
      case "departement":
        if (this.activeLayer == "departement") {
          this.activeLayer = "None"
          this.map.removeLayer(this.al)
        } else {
          this.activeLayer = "departement"
          this.setActiveLayerDepartement()
        }
        break;
    }
  }
  removeCurrentLayer() {
    this.activeLayer = "None";
    this.map.removeLayer(this.al)
  }
}
