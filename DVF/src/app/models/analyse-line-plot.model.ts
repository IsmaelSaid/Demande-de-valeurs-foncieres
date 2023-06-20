import { TopLevelSpec, compile } from 'vega-lite';
import { StandardType } from "vega-lite/build/src/type";
import { Analyse } from "./analyse.model";
export class AnalyseLinePlot extends Analyse {
  constructor(nomAnalyse: string,titre : string, public data:{'url':string} | {'values':Object}, xField: string, xType: string, yField: string, yType: string, colorField: string, colorType: string) {
    super(nomAnalyse,titre)
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
      data: this.data,
      "layer": [
        {
          "mark": { "type": "line", point: true },
          "encoding": {
            "x": {
              "field": this.xField,
              "type": <StandardType>this.xType,
              "axis":{"title":"Année"}
            },
            "y": {
              "field": this.yField,
              "type": <StandardType>this.yType,
              "axis":{"title":"Prix médian du m² (EUR)"}
            },
            "color": { "field": this.colorField, "type": <StandardType>this.colorType }
          }
        }
      ]
    };
  }
}