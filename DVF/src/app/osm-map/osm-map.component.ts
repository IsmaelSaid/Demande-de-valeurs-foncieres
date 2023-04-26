/// <reference types='leaflet-sidebar-v2' />
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, layerGroup, geoJson, Marker, LayerGroup, SidebarOptions, control, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import 'leaflet.markercluster';

import { PgsqlBack } from 'src/services/pgsql-back.service';
import { btn } from './btn';
import { Analyse } from '../models/analyse.model';

@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css'],

})

export class OsmMapComponent implements OnInit, OnDestroy {

  // @ViewChild(NgxSidebarControlComponent, { static: false })
  // sidebar: NgxSidebarControlComponent = new NgxSidebarControlComponent();
  

  // Configuration des contrôles
  controlOptions = { collapsed: true, position: 'topright' }
  map!: Map;
  zoom!: number;
  layers: Layer[] = []
  layersControl:any
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
  @Output() selectCommune$: EventEmitter<{ type: string, commune: string }> = new EventEmitter;


  constructor(private http: HttpClientODS, private postresql: PgsqlBack, private changeDetector:ChangeDetectorRef) {
    this.selectCommune$.subscribe(this.changeDetector.detectChanges)
    this.analyses = []
  }
  ngOnInit() {
    this.layersControl = {
      baseLayers: {
      },
      overlays: {}
    }
    this.initCommunesTiles(this.http);
    this.initEpciTiles(this.http);
    this.initDepartement(this.http)    
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
    new btn({ position: 'topright' }).addTo(this.map)

    
  }


  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  private initCommunesTiles(http: HttpClientODS) {
    console.info("Chargement communes");
    http.getCommunes().subscribe(response => {
      let layerGroupGeometrieCommunes = layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        let myStyle = {
          "weight": 1,
          "opacity": 0.5
        };
        let layer = geoJSON(JSON.parse(JSON.stringify(geometrie))).setStyle(myStyle).on('mouseover', (e) => {
          let mouseover = { "weight": 3, "opacity": 0.9 };
          e.target.setStyle(mouseover)
        })

        layer.on('mouseout', (e) => {
          let mouseover = { "weight": 1, "opacity": 0.5 };
          e.target.setStyle(mouseover)
        })
        layerGroupGeometrieCommunes.addLayer(layer.on("click", (_e: LeafletMouseEvent) => {
          // Emission d'un evenement
          this.analyses.forEach((analyse)=>{
            analyse.destroyView()
          })
          this.analyses = this.postresql.getAnalyseParCommune(value['com_code'][0])
          this.changeDetector.detectChanges()
        }));
      })
      this.layersControl.baseLayers['communes']=layerGroupGeometrieCommunes
    });
  }
  private initEpciTiles(http: HttpClientODS) {
    http.getEPCI().subscribe(response => {
      console.info('chargement epci')
      let layerGroupGeometrieEpci = layerGroup();
      response.forEach((value) => {
        let epci_code:string;
        console.info(value)
        let geometrie = value["geo_shape"];
        epci_code = value["epci_code"][0];
        let myStyle = {
          "weight": 1,
          "opacity": 0.5
        };
        let layer = geoJSON(JSON.parse(JSON.stringify(geometrie))).setStyle(myStyle).on('mouseover', (e) => {
          let mouseover = { "weight": 3, "opacity": 0.9 };
          e.target.setStyle(mouseover)
        })

        layer.on('mouseout', (e) => {
          let mouseover = { "weight": 1, "opacity": 0.5 };
          e.target.setStyle(mouseover)
        })

        layerGroupGeometrieEpci.addLayer(layer.on("click", (_e: LeafletMouseEvent) => {
          // Emission d'un evenement
          this.analyses.forEach((analyse)=>{
            analyse.destroyView()
          })
          this.analyses = this.postresql.getAnalyseParEpci(epci_code)
          this.changeDetector.detectChanges()
        }));
        // layerGroupGeometrieEpci.addLayer(geoJSON(JSON.parse(JSON.stringify(geometrie))));
      })
      this.layersControl.baseLayers['epci']=layerGroupGeometrieEpci
    });
  }
  private initDepartement(http:HttpClientODS){
    http.getDepartement().subscribe(response=>{
      let layerGroupGeometrieDepartement = layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        layerGroupGeometrieDepartement.addLayer(geoJSON(JSON.parse(JSON.stringify(geometrie))));
      })
      layerGroupGeometrieDepartement.eachLayer((layer)=>{
        layer.on('click',()=>{
          console.info("Clique département");
          this.analyses.forEach((analyse)=>{
            analyse.destroyView()
          })
          this.analyses = this.postresql.getAnalyseDefaut()
          this.changeDetector.detectChanges()

          
        })
      })
      this.layersControl.baseLayers.departement = layerGroupGeometrieDepartement
      this.changeDetector.detectChanges() 
    })
  }

  handlerCommuneClick(e : {type:string,commune:string}):void{
    this.analyses = this.postresql.getAnalyseParCommune(e.commune)
    this.changeDetector.detectChanges();
  }

}
