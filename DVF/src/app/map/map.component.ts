import { Component, AfterViewInit, OnInit, isDevMode } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { AnalysePiePlot } from '../models/analyse-pie-plot.model';
import { AnalyseLinePlot } from '../models/analyse-line-plot.model';
import { AnalyseBar } from '../models/analyse-bar-plot.model';
import { Analyse } from '../models/analyse.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte;
  analyses!: Analyse[]

  constructor(private http: HttpClientODS,private postgresSql:PgsqlBack) {
    this.carte = new Carte(http);
    this.analyses = postgresSql.getAnalyseDefaut();
  }

  ngAfterViewInit(): void {
    this.carte.initMap();
  }
  ngOnInit(): void {
  }


}