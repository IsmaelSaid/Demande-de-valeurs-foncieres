import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { AnalyseComponent } from './analyse/analyse.component';
import { AnalyseMultipleComponent } from './analyse-multiple/analyse-multiple.component';
import { CustomNavbarComponent } from './custom-navbar/custom-navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    AnalyseComponent,
    AnalyseMultipleComponent,
    CustomNavbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
