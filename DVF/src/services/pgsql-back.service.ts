import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  public getURL() {
    return this.url;
  }


  public getAnalyseDepartement(data: { "vente": object, "prix_median": object }, nom: string): Analyse[] {
    console.info(data.vente)
    return [
      new AnalyseLinePlot(
        "an2",
        nom,
        { "values": data.prix_median },
        "anneemut",
        "ordinal",
        "prix_m2_median",
        "quantitative",
        "type",
        "nominal"),
        new AnalyseBar(
          "an3",
          { 'values': data.vente },
          nom,
          "anneemut",
          "ordinal",
          "nombre",
          "quantitative",
          "type",
          "nominal")
    ]
  }

  public getAnalyseParCommune(data: { "vente": object, "prix_median": object }, nomCommune: string): Analyse[] {
    return [
      new AnalyseBar(
        "an3",
        { "values": data.vente },
        nomCommune,
        "anneemut",
        "ordinal",
        "nb_vendu",
        "quantitative",
        "type",
        "nominal")
    ]
  }

  public getAnalyseParEpci(data: { "vente": object, "prix_median": object }, nomEpci: string): Analyse[] {
    return [
      new AnalyseLinePlot(
        "an2",
        nomEpci,
        { "values": data.prix_median },
        "anneemut",
        "ordinal",
        "prix_m2_median",
        "quantitative",
        "type",
        "nominal"),
      new AnalyseBar(
        "an3",
        { 'values': data.vente },
        nomEpci,
        "anneemut",
        "ordinal",
        "nb_vendu",
        "quantitative",
        "type",
        "nominal")
    ]
  }

  public getanalyseIRIS(data: { "vente": object, "prix_median": object },nomIRIS : string) {
    return [new AnalyseBar(
      "an3",
      { "values": data.vente },
      nomIRIS,
      "anneemut",
      "ordinal",
      "nb_vendu",
      "quantitative",
      "type",
      "nominal")]
    }
    public getVenteEpci(codeEpci: string) {
      return this.http.get("/api/intercommunale/vente/" + codeEpci)
    }
    
    public getPrixMedianEpci(codeEpci: string) {
      return this.http.get("/api/intercommunale/prix_median/" + codeEpci)
    }

    public getStatsEpci(codeEpci: string) {
      return this.http.get("/api/intercommunale/stats/" + codeEpci)
    }



    
    public getVenteCommune(codeCommune: string) {
      return this.http.get("/api/commune/vente/" + codeCommune)
    }
    
    public getPrixMedianCommune(codeCommune: string) {
      return this.http.get("/api/commune/prix_median/" + codeCommune)
    }

    public getStatsCommune(codeCommune: string) {
      return this.http.get("/api/commune/stats/" + codeCommune)
    }
    
    public ventePrixMedian(codeEpci: string) {
      return this.http.get("/api/intercommunale/prixMedian/" + codeEpci)
    }
    
    public getVenteDepartement(){
      return this.http.get("/api/global/vente/")
    }
    
    public getPrixMedianDepartement(){
      return this.http.get("/api/global/prix_median/")
    }

    public getStatsDepartement(){
      return this.http.get("/api/global/stats/")
    }
  public epci_mapper(epci: string): string[] {
    let communes: string[] = []
    switch (epci) {
      case this.cinor:
        //Sainte Marie, Sainte Denis, Sainte Suzanne
        communes = ['97411', '97418', '97420'];
        break;
      case this.cirest:
        //Bras Panon, la plaine des palmistes, Saint andré, Saint benoit, Saint andré, Sainte Rose, Salazie
        communes = ['97402', '97406', '97409', '97410', '97419', '97421'];
        break;
      case this.casud:
        //Entre Deux, Saint-Joseph, Saint-Philippe, Le tampon
        communes = ['97403', '97412', '97417', '97422'];
        break;
      case this.civis:
        //Saint Louis, Cilaos, l'étang salé, les avirons, Petit île, Saint pierre, 
        communes = ['97414', '97424', '97416', '97422', '97414', '97401'];
        break;
      case this.tco:
        communes = ['97407', '97415', '97423', '97413'];
        break;
    }
    return communes
  }
}
