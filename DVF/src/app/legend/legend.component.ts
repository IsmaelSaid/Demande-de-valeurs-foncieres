import { Component, Input,OnInit } from '@angular/core';
import { Legend } from '../models/legend.model';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {
  @Input() legend!: Legend;
  

  constructor(){
    
  }
  ngOnInit(): void {
  }
}
