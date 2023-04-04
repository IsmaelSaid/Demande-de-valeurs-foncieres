
import { Config, TopLevelSpec, compile } from 'vega-lite';
import * as vega from 'vega';

export class Analyse {
    constructor(public nomAnalyse: string, public precision: string, public entite: string) {
    }
    getVegaView(){
        const vegaLiteSpec: TopLevelSpec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            data: {
                values: [
                    { a: 'A', b: 28 },
                    { a: 'B', b: 55 },
                    { a: 'C', b: 43 },
                    { a: 'D', b: 91 },
                    { a: 'E', b: 81 },
                    { a: 'F', b: 53 },
                    { a: 'G', b: 19 },
                    { a: 'H', b: 87 },
                    { a: 'I', b: 52 }
                ]
            },
            mark: 'bar',
            encoding: {
                x: { field: 'a', type: 'nominal', axis: { labelAngle: 0 } },
                y: { field: 'b', type: 'quantitative' }
            }
        };

        const config: Config = {
            bar: {
                color: 'firebrick'
            }
        };

        const vegaSpec = compile(vegaLiteSpec, { config }).spec;
        return new vega.View(vega.parse(vegaSpec)).renderer('canvas');
    }
}