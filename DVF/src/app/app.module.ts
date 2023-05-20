import { NgModule,LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { OsmMapComponent } from './osm-map/osm-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxSidebarControlModule } from '@runette/ngx-leaflet-sidebar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CanvasModule } from './canvas/canvas.module';
import { AnalyseMultipleComponent } from './analyse-multiple/analyse-multiple.component';
import { AnalyseComponent } from './analyse/analyse.component';
import { LegendComponent } from './legend/legend.component';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr'; 

@NgModule({
  declarations: [
    AppComponent,
    OsmMapComponent,
    LegendComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule,
    NgxSidebarControlModule,
    NgbModule,
    CanvasModule
  ],
  providers: [{
    provide : LOCALE_ID,useValue : 'fr-FR'
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
    registerLocaleData(fr.default);
  }
}
