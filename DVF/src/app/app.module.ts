import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { OsmMapComponent } from './osm-map/osm-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxSidebarControlModule } from '@runette/ngx-leaflet-sidebar';
import { AnalyseMultipleComponent } from './analyse-multiple/analyse-multiple.component';
import { AnalyseComponent } from './analyse/analyse.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    OsmMapComponent,
    AnalyseMultipleComponent,
    AnalyseComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule,
    NgxSidebarControlModule,
    NgbModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
