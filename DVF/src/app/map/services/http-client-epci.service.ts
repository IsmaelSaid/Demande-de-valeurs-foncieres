import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
/**
 * Ce service permet de récupérer l'ensemble des communes de la Réunion
 */
export class HttpClientEpci {
  configUrl = "asserts/config.json";
  private openDataSoftUrl = 'https://data.regionreunion.com/api/v2/catalog/datasets/';
  private datasetId = "intercommunalites-millesime-france/";
  private type = "exports/";
  private exportFormat = "json";
  private whereString = "year = date'2022'";

  constructor(private http: HttpClient) { }

  createUrl(): string {
    /**
     * 
     */
    let urlCreated = this.openDataSoftUrl + this.datasetId + this.type + this.exportFormat;
    return urlCreated;
  }
  
  getEpci(){
    /**
     * Retourne un observable
     * Si l'on souhaite spécifier plusieurs arguments au moment de la requête, 
     * Utilisez plutot HttpParams().appendAll() cf doc.
     */

    let params: HttpParams;
    params = new HttpParams().append("where", this.whereString);
    return this.http.get<[]>(this.createUrl(), {params: params});
  }
}
