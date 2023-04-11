import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from 'src/app/configuration/config';

@Injectable({
  providedIn: 'root'
})
export class PgsqlBack {
  private url = window.location.href;
  constructor(private http: HttpClient) { }

  getCountMutations(code_insee : string){
    let url = this.url + CONFIG.countMutationsEnpoint + code_insee;
    return this.http.get(url);
  }
  getCountTypeLocal(code_insee : string){
    let url = this.url + CONFIG.countTypeLocalEndpoint + code_insee;
    return this.http.get(url);
  }
  public getURL(){
    return this.url;
  }
}
