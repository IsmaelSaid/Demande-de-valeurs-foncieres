/// <reference types='leaflet-sidebar-v2' />
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, layerGroup, geoJson, Marker, LayerGroup, SidebarOptions, control, LeafletMouseEvent } from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxSidebarControlModule } from '@runette/ngx-leaflet-sidebar';
import { NgxSidebarControlComponent } from '@runette/ngx-leaflet-sidebar';
import 'leaflet.markercluster';

import { PgsqlBack } from 'src/services/pgsql-back.service';

@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css'],

})

export class OsmMapComponent implements OnInit, OnDestroy {
  @ViewChild(NgxSidebarControlComponent, { static: false }) sidebar!: NgxSidebarControlComponent;

  // Configuration des contrôles
  controlOptions = { collapsed: false, position: 'topleft' }
  map!: Map;
  zoom!: number;
  layers: Layer[] = []
  layersControl:any
  
  public sidebarOptions: SidebarOptions = {
    position: 'left',
    autopan: false,
    closeButton: false,
    container: 'sidebar',
  }

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


  constructor(private http: HttpClientODS, private postresql: PgsqlBack) {
    this.selectCommune$.subscribe(this.handlerCommuneClick)
  }
  ngOnInit() {
    this.layersControl = {
      baseLayers: {
      },
      overlays: {}
    }
    this.initCommunesTiles(this.http);
    this.initEpciTiles(this.http);
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
    console.log("map ready");

  }


  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  private initCommunesTiles(http: HttpClientODS) {
    console.log("Chargement communes");
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
        layerGroupGeometrieCommunes.addLayer(layer.on("click", (e: LeafletMouseEvent) => {
          // Emission d'un evenement
          this.selectCommune$.emit({
            type: "commune",
            commune: value['com_code'][0]
          })
        }));
      })
      this.layersControl.baseLayers['communes']=layerGroupGeometrieCommunes
    });
  }
  private initEpciTiles(http: HttpClientODS) {
    http.getEPCI().subscribe(response => {
      console.log('chargement epci')
      let layerGroupGeometrieEpci = layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        layerGroupGeometrieEpci.addLayer(geoJSON(JSON.parse(JSON.stringify(geometrie))));
      })
      this.layersControl.baseLayers['epci']=layerGroupGeometrieEpci
    });
  }

  handlerCommuneClick(e : {type:string,commune:string}):void{
    console.log(e.type);
    console.log(e.commune);
  }

}
