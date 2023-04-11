import { TopLevelSpec, compile } from 'vega-lite';
import { Aggregate } from "vega-lite/build/src/aggregate";
import { StandardType } from "vega-lite/build/src/type";
import { Analyse } from "./analyse.model";
import * as vega from 'vega';
export class AnalyseBar extends Analyse {
  constructor(
    nomAnalyse: string,
    public url: string,
    public xField: string,
    public xType: string,
    public yField: string,
    public yType: string,
    public colorField: string,
    public colorType: string
  ) { super(nomAnalyse) }

  createSpec(): TopLevelSpec {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { "url": this.url },
      "layer": [
        {
          "mark": { "type": "bar", point: true },
          "encoding": {
            "x": {
              "field": this.xField,
              "type": <StandardType>this.xType
            },
            "y": {
              "field": this.yField,
              "type": <StandardType>this.yType
            },
            "color": { "field": this.colorField, "type": <StandardType>this.colorType }
          }
        }
      ]
    };
  }
  public override createVegaView(): void {
    this.createDiv()
    const vegaSpec = compile(this.createSpec(), { config: this.getConfig() }).spec;
    new vega.View(vega.parse(vegaSpec)).renderer('canvas').initialize('#' + this.nomAnalyse).run();
  }
}