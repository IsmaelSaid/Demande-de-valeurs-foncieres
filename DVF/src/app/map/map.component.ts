import { Component, AfterViewInit, OnInit, isDevMode } from '@angular/core';
import { Carte } from '../models/carte.model';
import { HttpClientODS } from 'src/services/http-client-open-data-soft.service';
import { PgsqlBack } from 'src/services/pgsql-back.service';
import { Analyse } from '../models/analyse.model';
import { TopLevelSpec } from 'vega-lite/build/src/spec';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit {
  carte!: Carte;
  analyse = new Analyse("annal1", {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { "url": 'http://localhost:8080/api/global/vente/' },
    "layer": [
      {
        "mark": "line",
        "encoding": {
          "x": {
            "field": "anneemut",
            "type": "ordinal"
          },
          "y": {
            "field": "nombre",
            "type": "quantitative"
          },
          "color": {
            "field": "type",
            "type": "nominal"
          }
        }
      }
    ]
  });

  analyse2 = new Analyse("annal2", {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { "url": 'http://localhost:8080/api/global/vente/' },
    "layer": [
      {
        "mark": "bar",
        "encoding": {
          "x": {
            "field": "anneemut",
            "type": "ordinal"
          },
          "y": {
            "field": "nombre",
            "type": "quantitative"
          },
          "color": {
            "field": "type",
            "type": "nominal"
          }
        }
      }
    ]
  });

  analyse3 = new Analyse("annal3", {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { "url": 'http://localhost:8080/api/global/vente/' },
    "mark": "arc",
    "encoding": {
      "theta": { "aggregate": "mean", "field": "nombre" },
      "color": { "field": "type", "type": "nominal" }
    }
  });

  analyse4 = new Analyse("annal5", {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { "url": 'http://localhost:8080/api/global/type_local_vendu_par_commune' },
    "layer": [
      {
        "mark": "bar",
        "encoding": {
          "x": {
            "field": "l_codinsee",
            "type": "ordinal"
          },
          "y": {
            "field": "nb_vendu",
            "type": "quantitative"
          },
          "color": { "field": "type", "type": "nominal" }
        }
      }
    ]
  });

  constructor(private http: HttpClientODS, private pgsql: PgsqlBack) {
    this.carte = new Carte(http);
  }

  ngAfterViewInit(): void {
    this.carte.initMap();
  }
  ngOnInit(): void {
  }
}