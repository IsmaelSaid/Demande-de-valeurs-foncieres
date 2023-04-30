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
import { AnalyseBar } from '../models/analyse-bar-plot.model';

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
  @Output() selectCommune$: EventEmitter<{ type: string, commune: string }> = new EventEmitter;


  constructor(private http: HttpClientODS, private postresql: PgsqlBack, private changeDetector: ChangeDetectorRef) {
    this.selectCommune$.subscribe(this.changeDetector.detectChanges)
    this.analyses = []
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
    console.info("map ready");
    // new btn({ position: 'topright' }).addTo(this.map)


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
        // console.info(value)
        let communeCode = value["com_code"][0];
        this.postresql.getVenteCommune(communeCode).subscribe((dataVente) => {
          this.postresql.getPrixMedianCommune(communeCode).subscribe((dataPrixMedian) => {
            let nomCommune = value["com_name"][0];
            let geometrie = value["geo_shape"];
            let myJson = JSON.parse(JSON.stringify(geometrie))
            let myGeoJson;
            myJson["properties"]["vente"] = dataVente;
            myJson["properties"]["prix_median"] = dataPrixMedian;
            myJson["properties"]["nom"] = nomCommune;
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
            })
            layerGroupGeometrieCommunes.addLayer(myGeoJson);
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
            let epciName = value["epci_name"]
            let geometrie = value["geo_shape"];
            let myJson = JSON.parse(JSON.stringify(geometrie))
            let myGeoJson;
            myJson["properties"]["vente"] = dataVente;
            myJson["properties"]["prix_median"] = dataPrixMedian;
            myJson["properties"]["nom"] = epciName;
            myGeoJson = geoJSON(myJson)
            myGeoJson.setStyle(this.defaultStyle)
            myGeoJson.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) });
            myGeoJson.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) });
            myGeoJson.on("click", (_e: LeafletMouseEvent) => {
              this.analyses.forEach((analyse) => { analyse.destroyView() });
              this.analyses = this.postresql.getAnalyseParEpci(
                {
                  "vente": _e.sourceTarget.feature.properties.vente,
                  "prix_median": _e.sourceTarget.feature.properties.prix_median
                },
                _e.sourceTarget.feature.properties.nom)
              this.changeDetector.detectChanges()
            })
            layerGroupGeometrieEpci.addLayer(myGeoJson);
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
            let geometrie = value["geo_shape"];
            let myJson = JSON.parse(JSON.stringify(geometrie))
            let myGeoJson;
            myJson["properties"]["vente"] = dataVente;
            myJson["properties"]["prix_median"] = dataPrixMedian;
            myJson["properties"]["nom"] = "La Réunion";
            myGeoJson = geoJSON(myJson);
            myGeoJson.setStyle(this.defaultStyle);
            console.info(myGeoJson)
            myGeoJson.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) });
            myGeoJson.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) });
            myGeoJson.on("click", (_e: LeafletMouseEvent) => {
              this.analyses.forEach((analyse) => {analyse.destroyView()})
              this.analyses = this.postresql.getAnalyseDepartement({
                  "vente": _e.sourceTarget.feature.properties.vente,
                  "prix_median": _e.sourceTarget.feature.properties.prix_median
              }, _e.sourceTarget.feature.properties.nom)
              this.changeDetector.detectChanges()
            })
            layerGroupGeometrieDepartement.addLayer(myGeoJson);

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
        let nomIRIS = value["iris_name"]
        let geometrie = value["geo_shape"]
        let myjson = JSON.parse(JSON.stringify(geometrie))
        myjson["properties"]["nom"] = nomIRIS
        let mygeoJSON = geoJSON(myjson)
        mygeoJSON.setStyle(this.defaultStyle)
        mygeoJSON.on('mouseover', (e) => { e.target.setStyle(this.hoverStyle) })
        mygeoJSON.on('mouseout', (e) => { e.target.setStyle(this.defaultStyle) })
        layerGroupGeometrieIRIS.addLayer(mygeoJSON)
      })
      layerGroupGeometrieIRIS.getLayers().forEach((layer) => {
        layer.on("click", (_e: LeafletMouseEvent) => {
          this.analyses.forEach((analyse) => {analyse.destroyView()})
          this.analyses = this.postresql.getanalyseIRIS({ "values": _e.sourceTarget.feature.properties.data }, _e.sourceTarget.feature.properties.nom)
          this.changeDetector.detectChanges()
        })
      })
    })
    this.layersControl.baseLayers['IRIS'] = layerGroupGeometrieIRIS;
  }
}
