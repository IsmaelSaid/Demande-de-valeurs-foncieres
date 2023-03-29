/*
https://leafletjs.com/
Ce component permet d'instancier une carte leaflet
Améliorations: Sortir les paramètres de configuration de la carte.
*/

import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClientCommunes } from './services/http-client-communes.service';
import * as L from 'leaflet';
import { CommuneData } from './services/commune-data.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  private map!: L.Map;
  private initMap(): void {
    /*
    initMap permet de configurer une carte.
    */
    this.map = L.map('map', {
      center: [-21.12793576632045, 55.53617714019368],
      zoom: 10
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map)
  }
  /**
   * 
   * @param http 
   * @param communesData 
   */
  constructor(private http: HttpClientCommunes, private communesData:CommuneData) {
    console.log(this.communesData.getData());
    
  }
  ngOnInit(): void {
  
  }
  ngAfterViewInit(): void {
    /**
     * AfterViewInit permet de spécifier un traitement après l'initialisation de la vue 
     **/
    this.initMap();
  }
}
