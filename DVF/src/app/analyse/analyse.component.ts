import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Analyse } from '../models/analyse.model';
import { PgsqlBack } from 'src/services/pgsql-back.service';
@Component({
  selector: 'app-analyse',
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent implements OnInit,AfterViewInit{
  
  @Input() analyse!:Analyse;
  
  constructor (){
    
  }
  ngAfterViewInit(): void {
  }
  
  ngOnInit(): void {
    this.analyse.renderView()
  }

}
