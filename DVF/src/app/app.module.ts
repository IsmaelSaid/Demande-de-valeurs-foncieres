import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { OsmMapComponent } from './osm-map/osm-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxSidebarControlModule } from '@runette/ngx-leaflet-sidebar';


@NgModule({
  declarations: [
    AppComponent,
    OsmMapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule,
    NgxSidebarControlModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
