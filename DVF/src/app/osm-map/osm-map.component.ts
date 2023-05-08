/// <reference types='leaflet-sidebar-v2' />
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, layerGroup, geoJson, Marker, LayerGroup, SidebarOptions, control, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import 'leaflet.markercluster';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { Analyse } from '../models/analyse.model';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CanvasModule } from '../canvas/canvas.module';
import { CommonModule } from '@angular/common';
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
  controlOptions = { collapsed: false, position: 'topright' }
  defaultStyle = {
    "weight": 1,
    "opacity": 0.3,
    "fillOpacity": 0
  };

  hoverStyle = {
    "weight": 2,
    "opacity": 0.9,
    "fillOpacity": 0.3
  };
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

  // Configuration pour la programmation asynchrone
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Output() selected$: EventEmitter<string> = new EventEmitter;


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
    this.initIRIS(this.http);
    this.initDepartement(this.http);
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
    console.info("map ready");

  }


  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  private initCommunesTiles(http: HttpClientODS) {
    let layerGroupGeometrieCommunes = layerGroup();
    http.getCommunes().subscribe(response => {
      console.info('chargement communes')
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
              myGeoJson.setStyle(this.defaultStyle)
              myGeoJson.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) });
              myGeoJson.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) });
              myGeoJson.on("click", (_e: LeafletMouseEvent) => {
                this.analyses.forEach((analyse) => { analyse.destroyView() });
                this.analyses = this.postresql.getAnalyseParCommune(
                  {
                    "vente": _e.sourceTarget.feature.properties.vente,
                    "prix_median": _e.sourceTarget.feature.properties.prix_median
                  },
                  _e.sourceTarget.feature.properties.nom)
                this.changeDetector.detectChanges()
                this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
              })
              layerGroupGeometrieCommunes.addLayer(myGeoJson);
            })
          })
        })
      })
      this.layersControl.baseLayers['communes'] = layerGroupGeometrieCommunes
    });

  }
  private initEpciTiles(http: HttpClientODS) {
    let layerGroupGeometrieEpci = layerGroup();
    http.getEPCI().subscribe(response => {
      console.info('chargement epci')
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
              myGeoJson.setStyle(this.defaultStyle)
              myGeoJson.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) });
              myGeoJson.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) });
              myGeoJson.on("click", (_e: LeafletMouseEvent) => {
                this.analyses.forEach((analyse) => { analyse.destroyView() });
                // this.changeDetector.detectChanges()
                this.selected$.emit("test")
                this.analyses = this.postresql.getAnalyseParEpci(
                  {
                    "vente": _e.sourceTarget.feature.properties.vente,
                    "prix_median": _e.sourceTarget.feature.properties.prix_median
                  },
                  _e.sourceTarget.feature.properties.nom)
                this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
              })
              layerGroupGeometrieEpci.addLayer(myGeoJson);
            })
          })
        })
      })
      this.layersControl.baseLayers['epci'] = layerGroupGeometrieEpci
    });
  }
  private initDepartement(http: HttpClientODS) {
    let layerGroupGeometrieDepartement = layerGroup();
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
              myGeoJson.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) });
              myGeoJson.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) });
              myGeoJson.on("click", (_e: LeafletMouseEvent) => {
                this.analyses.forEach((analyse) => { analyse.destroyView() })
                this.analyses = this.postresql.getAnalyseDepartement({
                  "vente": _e.sourceTarget.feature.properties.vente,
                  "prix_median": _e.sourceTarget.feature.properties.prix_median
                }, _e.sourceTarget.feature.properties.nom)
                this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
              })
              layerGroupGeometrieDepartement.addLayer(myGeoJson);
            })

          })
        })

      })
      this.layersControl.baseLayers["departement"] = layerGroupGeometrieDepartement
    })
  }

  private initIRIS(http: HttpClientODS) {
    let layerGroupGeometrieIRIS = layerGroup();
    http.getIRIS().subscribe(response => {
      response.forEach((value) => {
        let nomIRIS = value["iris_name"];
        let geometrie = value["geo_shape"];
        let myjson = JSON.parse(JSON.stringify(geometrie));
        myjson["properties"]["nom"] = nomIRIS;
        // myjson["properties"]["stats"] = value["stats"];
        let mygeoJSON = geoJSON(myjson)
        mygeoJSON.setStyle(this.defaultStyle)
        mygeoJSON.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) })
        mygeoJSON.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) })
        layerGroupGeometrieIRIS.addLayer(mygeoJSON)
      })
      layerGroupGeometrieIRIS.getLayers().forEach((layer) => {
        layer.on("click", (_e: LeafletMouseEvent) => {
          this.analyses.forEach((analyse) => { analyse.destroyView() })
          this.analyses = this.postresql.getanalyseIRIS({ "values": _e.sourceTarget.feature.properties.data }, _e.sourceTarget.feature.properties.nom)
          this.changeDetector.detectChanges()
          this.open(this.analyses, _e.sourceTarget.feature.properties.stats, _e.sourceTarget.feature.properties.nom);
        })
      })
    })
    this.layersControl.baseLayers['IRIS'] = layerGroupGeometrieIRIS;
  }

  public coroplethVenteMaison() {
    let mygeoJSON = geoJson(this.layersControl.baseLayers['IRIS'].toGeoJSON(),{style : this.style})
    this.layersControl.baseLayers['IRIS'] = mygeoJSON;
  }
  public style(feature : any) {
    function getColor(d: number) {
      console.log(d)
      return d > 200 ? '#800026' :
      d > 100 ? '#BD0026' :
        d > 50 ? '#E31A1C' :
          d > 25 ? '#FC4E2A' :
            d > 10 ? '#FD8D3C' :
              d > 5 ? '#FEB24C' :
                d > 2 ? '#FED976' :
                  '#FFEDA0';
    }
    return {
        fillColor: getColor(feature.properties.stats[0].nombre_vente_appartements),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.5
    };
  }
}
