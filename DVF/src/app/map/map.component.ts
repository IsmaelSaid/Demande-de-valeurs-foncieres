import { Component, AfterViewInit, OnInit, isDevMode } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { Analyse } from '../models/analyse.model';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte;
  analyses!: Analyse[]


  constructor(private http: HttpClientODS, private postgresSql: PgsqlBack) {
    this.carte = new Carte(http);
    this.analyses = postgresSql.getAnalyseDefaut();
    
     this.carte.subscribe((next) => {
       switch (next['typeEvenement']) {
         case 'commune':
           console.log("Evenement de type commune");
           this.analyses.forEach((value)=>{
            value.destroyView();
            value.vegaview?.finalize();
           })
           this.analyses = postgresSql.getAnalyseParCommune(next['codeInsee'])
       }
     })
  }

  ngAfterViewInit(): void {
    this.carte.initMap();
  }
  ngOnInit(): void {
  }


}