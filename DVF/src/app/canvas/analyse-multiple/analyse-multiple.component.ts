import { Component, Input, OnInit } from '@angular/core';
import { Analyse } from '../../models/analyse.model';

@Component({
  selector: 'app-analyse-multiple',
  templateUrl: './analyse-multiple.component.html',
  styleUrls: ['./analyse-multiple.component.css']  
})
export class AnalyseMultipleComponent{
  @Input() analyses: Analyse[] = [];
}
