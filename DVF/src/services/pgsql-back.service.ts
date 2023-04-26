import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from 'src/app/configuration/config';
import { AnalyseLinePlot } from 'src/app/models/analyse-line-plot.model';
import { AnalyseBar } from 'src/app/models/analyse-bar-plot.model';
import { Analyse } from 'src/app/models/analyse.model';

@Injectable({
  providedIn: 'root'
})
export class PgsqlBack {
   cinor = "249740119"
   cirest = "249740093"
   civis = "249740077"
   casud = "249740085";
   tco = "249740077";
  private url = window.location.href;
  constructor(private http: HttpClient) { }

  public getURL(){
    return this.url;
  }


  public getAnalyseDefaut(): Analyse[] {
    return [
      new AnalyseLinePlot("annal5","Reunion",
      this.url + "api/global/prix_median/",
      "anneemut",
      "ordinal",
      "prix_m2_median",
      "quantitative",
      "type",
      "nominal"),
      new AnalyseBar("annal2","Reunion",
        this.url + "api/global/vente/",
        "anneemut",
        "ordinal",
        "nombre",
        "quantitative",
        "type",
        "nominal")
      // new AnalyseBar("annal4","Reunion",
      //   this.url + CONFIG.routeGlobalTypeLocalVendu,
      //   "l_codinsee",
      //   "ordinal",
      //   "nb_vendu",
      //   "quantitative",
      //   "type",
      //   "nominal"),
      ]
    }

    public getAnalyseParCommune(code_insee:string):Analyse[] {
      return [
        new AnalyseLinePlot("an2",code_insee,
        this.url + "api/commune/prix_median/" + code_insee,
        "anneemut",
        "ordinal",
        "prix_m2_median",
        "quantitative",
        "type",
        "nominal"),
        new AnalyseBar("an3",code_insee,
        this.url + "api/commune/vente/" + code_insee,
        "anneemut",
        "ordinal",
        "nb_vendu",
        "quantitative",
        "type",
        "nominal")
      ]
    }

    public getAnalyseParEpci(code_insee:string):Analyse[] {
      return [
        new AnalyseLinePlot("an2",code_insee,
        this.url + "api/intercommunale/prix_median/" + code_insee,
        "anneemut",
        "ordinal",
        "prix_m2_median",
        "quantitative",
        "type",
        "nominal"),
        new AnalyseBar("an3",code_insee,
        this.url + "api/intercommunale/vente/" + code_insee,
        "anneemut",
        "ordinal",
        "nb_vendu",
        "quantitative",
        "type",
        "nominal")
      ]
    }

    public epci_mapper(epci : string) :string[] {
      let communes : string[] = []
      switch (epci){
        case this.cinor:
          //Sainte Marie, Sainte Denis, Sainte Suzanne
          communes = ['97411','97418','97420'];
          break;
        case this.cirest:
          //Bras Panon, la plaine des palmistes, Saint andré, Saint benoit, Saint andré, Sainte Rose, Salazie
          communes = ['97402','97406','97409','97410','97419','97421'];
          break;
        case this.casud:
          //Entre Deux, Saint-Joseph, Saint-Philippe, Le tampon
          communes = ['97403','97412','97417','97422'];
          break;
        case this.civis:
          //Saint Louis, Cilaos, l'étang salé, les avirons, Petit île, Saint pierre, 
          communes = ['97414','97424','97416','97422','97414','97401'];
          break;
        case this.tco:
          communes = ['97407','97415','97423','97413'];
          break;
      }
      return communes
    }
}
