import { TopLevelSpec, compile } from 'vega-lite';
import { Aggregate } from "vega-lite/build/src/aggregate";
import { StandardType } from "vega-lite/build/src/type";
import { Analyse } from "./analyse.model";
import * as vega from 'vega';

export class AnalyseDiagrammeCirculaire extends Analyse {
    constructor(
        nomAnalyse: string,
        public url: string,
        public colorField: string,
        public colorType: string,
        public thetaAgregate: string,
        public thetaField: string
    ) { super(nomAnalyse) }

    createSpec(): TopLevelSpec {
        return {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
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

    public override createVegaView(): void {
        this.createDiv()
        const vegaSpec = compile(this.createSpec(), { config: this.getConfig() }).spec;
        new vega.View(vega.parse(vegaSpec)).renderer('canvas').initialize('#'+this.nomAnalyse).run();
    }
}