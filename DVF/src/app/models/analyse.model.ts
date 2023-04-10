
import { Config, TopLevelSpec, compile } from 'vega-lite';
import * as vega from 'vega';

export class Analyse {
    constructor(public nomAnalyse: string, public vegaLiteSpec:TopLevelSpec) {
    }
    public renderView(){

        const config: Config = {
            bar: {
                color: 'firebrick'
            }
        };
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