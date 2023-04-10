
import { Config, TopLevelSpec, compile } from 'vega-lite';
import * as vega from 'vega';

export class Analyse {
    constructor(public nomAnalyse: string, public vegaLiteSpec:TopLevelSpec) {
    }
    public renderView(){

        const config: Config = {
            "background": "#fff",
            "arc": {"fill": "#3e5c69"},
            "area": {"fill": "#3e5c69"},
            "line": {"stroke": "#3e5c69"},
            "rect": {"fill": "#3e5c69"},
            "axis": {
              "domainWidth": 0.5,
              "grid": true,
              "labelPadding": 2,
              "tickSize": 5,
              "tickWidth": 0.5,
              "titleFontWeight": "normal"
            },
            "axisBand": {"grid": false},
            "axisX": {"gridWidth": 0.2},
            "axisY": {"gridDash": [3], "gridWidth": 0.4},
            "legend": {"labelFontSize": 11, "padding": 1, "symbolType": "square"},
            "range": {
              "category": [
                "#3e5c69",
                "#6793a6",
                "#182429",
                "#0570b0",
                "#3690c0",
                "#74a9cf",
                "#a6bddb",
                "#e2ddf2"
              ]
            }
          }
        // Création d'un spec vega
        const vegaSpec = compile(this.vegaLiteSpec, { config }).spec;

        // Création d'un élement du dom pour acceuillir le graphique
        const app = document.getElementById("analyse");
        const div = document.createElement("div");
        // Ajout d'un id à l'élement du dom
        div.id = this.nomAnalyse

        // Ajout de l'élement dans le dom
        app?.append(div)

        // Création d'un graphique
        new vega.View(vega.parse(vegaSpec)).renderer('canvas').initialize('#'+this.nomAnalyse).run();
    }
}