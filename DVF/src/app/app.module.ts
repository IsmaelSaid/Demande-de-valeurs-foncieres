import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent,
    OsmMapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule,
    NgxSidebarControlModule,
    NgbModule,
    CanvasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
