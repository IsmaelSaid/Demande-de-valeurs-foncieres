import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class HttpClientIris {
  configUrl = "asserts/config.json";
  private openDataSoftUrl = 'https://data.opendatasoft.com/explore/dataset/';
  private datasetId = "georef-france-iris@public";
  private type = "exports/";
  private exportFormat = "json";
  // private whereString = "reg_name = La Réunion";

  constructor(private http: HttpClient) { }

  createUrl(): string {
    /**
     * 
     */
    let urlCreated = this.openDataSoftUrl + this.datasetId + this.type + this.exportFormat;
    return urlCreated;
  }
  
  getIris(){
    /**
     * Retourne un observable
     * Si l'on souhaite spécifier plusieurs arguments au moment de la requête, 
     * Utilisez plutot HttpParams().appendAll() cf doc.
     */

    let params: HttpParams;
    // params = new HttpParams().append("where", this.whereString);
    // return this.http.get<[]>(this.createUrl(), {params: params});
    return this.http.get<[]>("/assets/iris-millesime-la-reunion.json");
  }
}
