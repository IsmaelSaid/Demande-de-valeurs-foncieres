import { TopLevelSpec, compile } from 'vega-lite';
import { StandardType } from "vega-lite/build/src/type";
import { Analyse } from "./analyse.model";
export class AnalyseBar extends Analyse {
  constructor(nomAnalyse: string, public url: string, xField: string, xType: string, yField: string, yType: string, colorField: string, colorType: string) {
    super(nomAnalyse)
    this.xField = xField;
    this.xType = xType;
    this.yField = yField;
    this.yType = yType;
    this.colorField = colorField;
    this.colorType = colorType;
  }

  createSpec(): TopLevelSpec {
    return {
      $schema: this.schema,
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
}