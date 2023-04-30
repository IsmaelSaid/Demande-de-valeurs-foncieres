import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CONFIG } from 'src/app/configuration/config';

@Injectable({
  providedIn: 'root'
})
export class HttpClientODS {
  private params = new HttpParams().append("where", "year = date'2022'");
  private type = "exports/";
  private exportFormat = "json";
  private openDataSoftUrl = CONFIG.urlOpenDataSoft;
  private communeDatasetID = CONFIG.communesDatasetID;
  private epciDatasetID = CONFIG.epciDatasetID;
  private irisDatasetID = CONFIG.irisDatasetAssets;
  private departementDatasetID = CONFIG.departementDatasetAssets;
  constructor(private http: HttpClient) { }

  createUrl(datasetID: string): string {
    let urlCreated = this.openDataSoftUrl + datasetID + this.type + this.exportFormat;
    return urlCreated;
  }

  getEPCI() {
    return this.http.get<[]>(this.createUrl(this.epciDatasetID), { params: this.params });
  }

  getCommunes() {
    let params: HttpParams;
    return this.http.get<[]>(this.createUrl(this.communeDatasetID), { params: this.params });
  }

  getIRIS() {
    return this.http.get<[]>("/assets/custom_IRIS.json");

  }

  getDepartement(){
    return this.http.get<[]>(this.departementDatasetID)
  }

  public getOpenDataSoftUrl(){
    return this.openDataSoftUrl;
  }
  public getCommuneDatasetID(){
    return this.communeDatasetID
  }
  public getEpciDatasetID(){
    return this.epciDatasetID
  }
  public getIrisDatasetID(){
    return this.irisDatasetID
  }
}
