/*
https://leafletjs.com/
Ce component permet d'instancier une carte leaflet
Améliorations: Sortir les paramètres de configuration de la carte.
*/

import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommunesService } from '../communes.service';
import * as L from 'leaflet';

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
   * La carte dépend directement du service Commune service 
   * @param CommunesService 
   */
  constructor(private CommunesService: CommunesService) {
    // La fonction `subscribe()` prend en paramètre un observer ou une fonction, qui sera appelé chaque fois qu'un nouvel élément sera émis par l'observable.
    // L'observable est l'objet auquel la fonction `subscribe()` est attachée.
    // this.CommunesService.getCommunes();
  }
  ngOnInit(): void {
    /**
     * Récupération de l'ensemble des formes géométriques
     * Quel enfer
     */
    this.CommunesService.getCommunes().subscribe(response => {
      console.log(response.length);
      response.forEach((value, index) => {          
        console.log(value["geo_point_2d"])
        // console.log(value["geo_shape"])
        console.log(value["com_name_upper"])
      })
    })
  }
  ngAfterViewInit(): void {
    /*
    AfterViewInit permet de spécifier un traitement après l'initialisation de la vue
    */
    this.initMap();
  }
}
