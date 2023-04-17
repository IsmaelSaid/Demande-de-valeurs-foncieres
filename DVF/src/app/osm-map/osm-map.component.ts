import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, geoJSON, layerGroup, geoJson, MarkerClusterGroup, MarkerClusterGroupOptions, Marker, LayerGroup } from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import 'leaflet.markercluster';
import { Analyse } from '../models/analyse.model';
import { PgsqlBack } from 'src/services/pgsql-back.service';

@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css',]
})
export class OsmMapComponent implements OnInit, OnDestroy {
  analyses:Analyse[]
  // Configuration marker cluster
  markerClusterOptions!: MarkerClusterGroupOptions;
  markerClusterData: Marker[] = [];
  markerClusterGroup!: MarkerClusterGroup;

  // Configuration des contrôles
  controlOptions = {collapsed: true, position: 'topleft'}
  map!: Map;
  zoom!: number;

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
  

  layers: Layer[] = []
  layersControl = {
    baseLayers: {
      'communes': new Layer(),
      'epci': new Layer(),
      'departement':new Layer()
    },
    overlays: {}
  }


  // Configuration pour la programmation asynchrone
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Output() addedlayer$: EventEmitter<LayerGroup> = new EventEmitter;
  @Output() communeClick$: EventEmitter<string> = new EventEmitter;


  constructor(private http: HttpClientODS,private postresql:PgsqlBack) {
    this.initCommunesTiles(this.http);
    this.initEpciTiles(this.http);
    this.initDepartement(this.http)
    this.analyses = this.postresql.getAnalyseDefaut()
    this.addedlayer$.subscribe((val) => { this.addedlayerHandler(val) })
    this.communeClick$.subscribe((val) =>{
      console.log("trigger "+val);
      this.analyses.forEach((analyse)=>{
        // analyse.vegaview?.finalize()
        // analyse.destroyView()

      })
      this.analyses = this.postresql.getAnalyseParCommune(val)
      
    })
  }

  ngOnInit() {


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
  }


  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  private initCommunesTiles(http: HttpClientODS) {
    http.getCommunes().subscribe(response => {
      let layerGroupCommunes = layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        layerGroupCommunes.addLayer(geoJSON(JSON.parse(JSON.stringify(geometrie))).on('click',(e: L.LeafletMouseEvent)=>{
          // this.analyses.forEach((analyse)=>{analyse.destroyView()})
          // this.analyses = this.postresql.getAnalyseParCommune()
          this.communeClick$.emit(value['com_code'][0])
        }))
      })

      this.layersControl.baseLayers.communes = layerGroupCommunes
    })
  };
  
  private initEpciTiles(http: HttpClientODS) {
    http.getEPCI().subscribe(response => {
      let layerGroupGeometrieEpci = layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        let layer = geoJSON(JSON.parse(JSON.stringify(geometrie))).on('click',(e)=>{
          console.log("epci");
          console.log(e);
          
        })
        layerGroupGeometrieEpci.addLayer(layer);
      })
      this.layersControl.baseLayers.epci = layerGroupGeometrieEpci
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
          console.log("default");
          
          console.log(layer);
          this.analyses = this.postresql.getAnalyseDefaut()

          
        })
      })
      this.layersControl.baseLayers.departement = layerGroupGeometrieDepartement      
    })
  }

  private addedlayerHandler(layer: LayerGroup) {
  }
  communeClickHandler(val: string) {
    console.log("commune click hand"+val);
    
    this.analyses.forEach((analyse)=>{
      analyse.destroyView()
    })
    this.analyses = this.postresql.getAnalyseParCommune(val)
    
  }

}
