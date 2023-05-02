import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyseMultipleComponent } from '../analyse-multiple/analyse-multiple.component';
import { AnalyseComponent } from '../analyse/analyse.component';
@NgModule({
  declarations: [
    AnalyseMultipleComponent,
    AnalyseComponent
  ],
  imports: [
    CommonModule
  ],
  exports : [AnalyseMultipleComponent,AnalyseComponent]
})
export class CanvasModule { }
