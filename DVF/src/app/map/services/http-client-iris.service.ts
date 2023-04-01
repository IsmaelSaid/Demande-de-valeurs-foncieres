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

  constructor(private http: HttpClient) { }

  createUrl(): string {
    let urlCreated = this.openDataSoftUrl + this.datasetId + this.type + this.exportFormat;
    return urlCreated;
  }
  
  getIris(){
    let params: HttpParams;
    return this.http.get<[]>("/assets/iris-millesime-la-reunion.json");
  }
}
