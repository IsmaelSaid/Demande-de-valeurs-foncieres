import { TopLevelSpec, compile } from 'vega-lite';
import { Aggregate } from "vega-lite/build/src/aggregate";
import { StandardType } from "vega-lite/build/src/type";
import { Analyse } from "./analyse.model";

export class AnalysePiePlot extends Analyse {
    constructor(
        nomAnalyse: string,titre:string, public url: string, colorField: string, colorType: string, thetaAgregate: string, thetaField: string) {
        super(nomAnalyse,titre);
        this.colorField = colorField;
        this.colorType = colorType;
        this.thetaAgregate = thetaAgregate;
        this.thetaField = thetaField;
    }
    createSpec(): TopLevelSpec {
        return {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            title:this.titre,
            data: { "url": this.url },
            "mark": { "type": "arc", "tooltip": true },
            "encoding": {
                "theta": {
                    "aggregate": <Aggregate>this.thetaAgregate,
                    "field": this.thetaField
                },
                "color": {
                    "field": this.colorField,
                    "type": <StandardType>this.colorType
                }
            }
        }
    }
}