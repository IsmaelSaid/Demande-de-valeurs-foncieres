import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpClientCommunes {
  configUrl = "asserts/config.json";
  private openDataSoftUrl = 'https://data.regionreunion.com/api/v2/catalog/datasets/';
  private datasetId = "communes-millesime-france/";
  private type = "exports/";
  private exportFormat = "json";
  private whereString = "year = date'2022'";

  constructor(private http: HttpClient) { }

  createUrl(): string {
    let urlCreated = this.openDataSoftUrl + this.datasetId + this.type + this.exportFormat;
    return urlCreated;
  }
  
  getCommunes(){
    let params: HttpParams;
    params = new HttpParams().append("where", this.whereString);
    return this.http.get<[]>(this.createUrl(), {params: params});
  }
}
