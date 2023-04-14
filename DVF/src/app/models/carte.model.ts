import * as L from 'leaflet';
import { CONFIG } from '../configuration/config';
import { HttpClientODS } from '../../services/http-client-open-data-soft.service';
import { EventEmitter } from '@angular/core';
export class Carte extends EventEmitter{
    private map!: L.Map;
    private layerControl = new  L.Control.Layers()
    constructor(private http:HttpClientODS) {
        super();
    }

    initMap() {
        this.map = L.map('map', {
            center: <L.LatLngExpression>CONFIG.localisationReunion,
            zoom: CONFIG.zoom
        });

        const tiles = L.tileLayer(CONFIG.tiles, {
            maxZoom: CONFIG.maxZoom,
            minZoom: CONFIG.minzoom,
            attribution: CONFIG.attribution
        }).addTo(this.map);

        
        this.initCommunesTiles(this.http);
        this.initEpciTiles(this.http);
        this.initIrisTiles(this.http);
        this.layerControl.addTo(this.map);
        
    }
    private initCommunesTiles(http: HttpClientODS) {
        http.getCommunes().subscribe(response => {
            let layerGroupGeometrieCommunes = L.layerGroup();
            response.forEach((value) => {
                let geometrie = value["geo_shape"];
                // let nom = value["com_name_upper"];
                // console.info(value);
                console.log(value);
                
                layerGroupGeometrieCommunes.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))).on("click", (e: L.LeafletMouseEvent) => {
                    // Emission d'un evenement
                    this.emit({
                        typeEvenement:"commune",
                        codeInsee:value['com_code'][0]
                    })
                }));
            })
            this.layerControl.addOverlay(layerGroupGeometrieCommunes, "Géométrie-communes");
        });
    }
    private initEpciTiles(http: HttpClientODS) {
        http.getEPCI().subscribe(response => {
            let layerGroupGeometrieEpci = L.layerGroup();
            response.forEach((value) => {
                let geometrie = value["geo_shape"];
                layerGroupGeometrieEpci.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))));
            })
            this.layerControl.addOverlay(layerGroupGeometrieEpci, "Géométrie-EPCI");
        });
    }
    private initIrisTiles(http: HttpClientODS) {
        http.getIRIS().subscribe(response => {
            let layerGroupGeometrieEpci = L.layerGroup();
            response.forEach((value) => {
                let geometrie = value["geo_shape"];
                layerGroupGeometrieEpci.addLayer(L.geoJSON(JSON.parse(JSON.stringify(geometrie))));
            })
            this.layerControl.addOverlay(layerGroupGeometrieEpci, "Géométrie-IRIS");
        });
    }
}