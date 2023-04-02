import * as L from 'leaflet';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClientCommunes } from './services/http-client-communes.service';
import { HttpClientEpci } from './services/http-client-epci.service';
import { HttpClientIris } from './services/http-client-iris.service';
import { HttpDVF } from './services/http-client-dvf.service';
import { Analyse } from './models/analyse.model';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  private map!: L.Map;
  private layerControl = L.control.layers();
  analyse: Analyse | undefined;

  constructor(
    private httpClientCommunes: HttpClientCommunes,
    private httpClientEpci: HttpClientEpci,
    private httpClientIris: HttpClientIris,
    private httpDVF:HttpDVF) { }
  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.initMap();
    this.initCommunesTiles(this.httpClientCommunes);
    this.initEpciTiles(this.httpClientEpci);
    this.initIrisTiles(this.httpClientIris);
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [-21.12793576632045, 55.53617714019368],
      zoom: 11
    });

    const tiles = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", {
      maxZoom: 15,
      minZoom: 3,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });
    tiles.addTo(this.map);
    this.layerControl.addTo(this.map);

  }
  private initCommunesTiles(httpClientCommunes: HttpClientCommunes) {
    httpClientCommunes.getCommunes().subscribe(response => {
      let layerGroupGeometrieCommunes = L.layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        let nom = value["com_name_upper"];
        layerGroupGeometrieCommunes.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))).on("click", (e: L.LeafletMouseEvent) => {
          this.analyse = new Analyse("Test de l'analyse", "commune", nom);
          this.analyse.getVegaView().initialize('#chart').run();

        }));
      })
      this.layerControl.addOverlay(layerGroupGeometrieCommunes, "Géométrie-communes");
    });
  }
  private initEpciTiles(httpClientEpci: HttpClientEpci) {
    httpClientEpci.getEpci().subscribe(response => {
      let layerGroupGeometrieEpci = L.layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        layerGroupGeometrieEpci.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))));
      })
      this.layerControl.addOverlay(layerGroupGeometrieEpci, "Géométrie-EPCI");
    });
  }
  private initIrisTiles(httpClientIris: HttpClientIris) {
    httpClientIris.getIris().subscribe(response => {
      let layerGroupGeometrieEpci = L.layerGroup();
      response.forEach((value) => {
        let geometrie = value["geo_shape"];
        layerGroupGeometrieEpci.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))));
      })
      this.layerControl.addOverlay(layerGroupGeometrieEpci, "Géométrie-IRIS");
    });
  }
}
