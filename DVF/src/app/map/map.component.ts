import * as L from 'leaflet';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClientCommunes } from './services/http-client-communes.service';
import { CommuneData } from './services/commune-data.service';
import { Commune } from './models/commune.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  private map!: L.Map;
  private data: Commune[] = [];
  private initMap(): void {
    /*
    initMap permet de configurer une carte.
    */
    this.map = L.map('map', {
      center: [-21.12793576632045, 55.53617714019368],
      zoom: 11
    });

    const tiles = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", {
      maxZoom: 15,
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
  constructor(private http: HttpClientCommunes, private communesData: CommuneData) {
    // console.log(this.communesData.getData());
    // this.addGeoJson(communesData);
    http.getCommunes().subscribe(response => {
      response.forEach((value, index) => {
          let nom = value["com_name_upper"];
          let localisation = <{ "lat": number, "long": number }> value["geo_point_2d"];
          let geometrie = value["geo_shape"];
          let codepostal = 1; 
          let commune = new Commune(nom,codepostal,localisation,geometrie);
          L.geoJSON(JSON.parse(JSON.stringify(geometrie))).addTo(this.map);

      })
  });
  console.log(this.data.length);
  
    

  }
  ngOnInit(): void {


  }
  ngAfterViewInit(): void {
    /**
     * AfterViewInit permet de spécifier un traitement après l'initialisation de la vue 
     **/
    this.initMap();
  }

  private addGeoJson(data : CommuneData): void {
    console.log(data.getData().length);
    console.log("trigger");
  }
}
