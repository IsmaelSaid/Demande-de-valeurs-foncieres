import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte

  constructor(private http: HttpClientODS) {
    this.carte = new Carte(http);
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