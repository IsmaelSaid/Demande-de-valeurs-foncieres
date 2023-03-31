import * as L from 'leaflet';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClientCommunes } from './services/http-client-communes.service';
import { Commune } from './models/commune.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  private map!: L.Map;
  private communesOverlay!:L.Layer;
  private layerControl = L.control.layers();

  constructor(private http: HttpClientCommunes) {}
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.initMap();
    this.initCommunesTiles(this.http);
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [-21.12793576632045, 55.53617714019368],
      zoom: 11
    });

    const tiles = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", {
      maxZoom: 15,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);
    this.layerControl.addTo(this.map);

  }
  private initCommunesTiles(http: HttpClientCommunes){
    http.getCommunes().subscribe(response => {

      // Création d'un groupe de layer qui va contenir l'ensemble des formes géométrique
      let layerGroupGeometrieCommunes =  L.layerGroup();

      // Création d'un groupe de layer qui va contenir un point de localisation pour les villes
      let layerGroupLocalisationCommunes = L.layerGroup();
      response.forEach((value, index) => {
        let nom = value["com_name_upper"];
        let localisation = <{ "lat": number, "lng": number }>value["geo_point_2d"];
        let geometrie = value["geo_shape"];
        let codepostal = 1;
        // let commune = new Commune(nom, codepostal, localisation, geometrie);
        layerGroupGeometrieCommunes.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))));
        layerGroupLocalisationCommunes.addLayer(L.marker(localisation))
      })
      this.layerControl.addOverlay(layerGroupGeometrieCommunes,"Géométrie communes base");
      this.layerControl.addOverlay(layerGroupLocalisationCommunes,"Localisation communes");
    });
  }
}
