import { Injectable } from "@angular/core";
import { Commune } from "../models/commune.model";
import { HttpClientCommunes } from "./http-client-communes.service";

@Injectable({
    providedIn: 'root'
})
export class CommuneData {
    private communes:Commune[] = [];

    constructor(private http: HttpClientCommunes) {
        /**
         * 1) Récuperer les données de open data soft à partir de 
         * HttpClientCommunes
         * 2) Instancier le tableau des communes
         */

        this.http.getCommunes().subscribe(response => {
            response.forEach((value, index) => {
                let nom = value["com_name_upper"];
                let localisation = <{ "lat": number, "long": number }> value["geo_point_2d"];
                let geometrie = value["geo_shape"];
                let codepostal = 1; 
                let commune = new Commune(nom,codepostal,localisation,geometrie);
                this.communes.push(commune);
                // console.log(geometrie);
            })
        })
    }

    public getData():Commune[]{
        return this.communes;
    }
}