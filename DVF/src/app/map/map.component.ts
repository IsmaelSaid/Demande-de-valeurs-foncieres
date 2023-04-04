import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';
import { PgsqlBack } from 'src/services/pgsql-back.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte

  constructor(private http: HttpClientODS,private pgsql : PgsqlBack) {
    this.carte = new Carte(http);
    this.pgsql.get().subscribe((val)=>{
      console.log(val);
      
    })
    
  }

  ngAfterViewInit(): void {
    this.carte.initMap();
    this.carte.subscribe((value)=>{
      console.log("ok");
      
    })

  }
  ngOnInit(): void {
  }
}