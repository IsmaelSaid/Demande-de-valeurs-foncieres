import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from 'src/app/configuration/config';
import { AnalyseLinePlot } from 'src/app/models/analyse-line-plot.model';
import { AnalyseBar } from 'src/app/models/analyse-bar-plot.model';
import { AnalysePiePlot } from 'src/app/models/analyse-pie-plot.model';
import { Analyse } from 'src/app/models/analyse.model';

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


  public getAnalyseDefaut(): Analyse[] {
    return [
      new AnalyseBar("annal2",
        this.url+CONFIG.apiGlobalVente,
        "anneemut",
        "ordinal",
        "nombre",
        "quantitative",
        "type",
        "nominal"),
      new AnalyseBar("annal4",
        this.url + CONFIG.apiGlobalTypeLocalVenduParCommune,
        "l_codinsee",
        "ordinal",
        "nb_vendu",
        "quantitative",
        "type",
        "nominal"),
        new AnalyseLinePlot("annal5",
        this.url + CONFIG.apiGlobalEvolutionPrixParTypeLocal,
        "anneemut",
        "ordinal",
        "prix_m2_median",
        "quantitative",
        "type",
        "nominal"),
        
        new AnalyseBar("annal1",
          this.url + CONFIG.apiGlobalprixMedianMaisonAppartement,
          "type",
          "ordinal",
          "prix_m2_median",
          "quantitative",
          "type",
          "nominal"),
      ]
    }
}
