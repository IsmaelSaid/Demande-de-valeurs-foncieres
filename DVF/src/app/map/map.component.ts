import { Component, AfterViewInit, OnInit, isDevMode } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { AnalysePiePlot } from '../models/analyse-pie-plot.model';
import { AnalyseLinePlot } from '../models/analyse-line-plot.model';
import { AnalyseBar } from '../models/analyse-bar-plot.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte;


  analyse1 = new AnalyseLinePlot("annal1",
    "http://localhost:8080/api/global/vente/",
    "anneemut",
    "ordinal",
    "nombre",
    "quantitative",
    "type",
    "nominal")


  analyse2 = new AnalyseBar("annal2",
    "http://localhost:8080/api/global/vente/",
    "anneemut",
    "ordinal",
    "nombre",
    "quantitative",
    "type",
    "nominal")


  analyse3 = new AnalysePiePlot("annal3",
    "http://localhost:8080/api/global/vente/",
    "type",
    "nominal",
    "mean",
    "nombre");



  analyse4 = new AnalyseBar("annal4",
    "http://localhost:8080/api/global/type_local_vendu_par_commune",
    "l_codinsee",
     "ordinal",
     "nb_vendu",
     "quantitative",
     "type",
     "nominal")


  analyse5 = new AnalyseLinePlot("annal5",
    "http://localhost:8080/api/global/evolution_prix_par_type_local/",
    "anneemut",
     "ordinal",
     "prix_m2_median",
     "quantitative", 
    "type", 
    "nominal")

  constructor(private http: HttpClientODS, private pgsql: PgsqlBack) {
    this.carte = new Carte(http);
  }

  ngAfterViewInit(): void {
    this.carte.initMap();
  }
  ngOnInit(): void {
  }
}