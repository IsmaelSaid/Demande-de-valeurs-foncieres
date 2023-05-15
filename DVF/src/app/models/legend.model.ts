
import _ from 'lodash';
import * as math from 'mathjs';


export class Legend {
    color: string[] = ['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d']
    data : number [] = []
    threshold;
    quartil = [0.25, 0.5, 0.75]
    constructor(public name: string, layer : any, public type : 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements') {
        this.data = _.map(layer.getLayers(),this.extractDataFromLayer(type))
        this.threshold = this.quartil.map((q) => {return math.quantileSeq(this.data, q)})
        console.info(this.threshold)
    }
    public getStyler() {
        let fn: (feature: any) => { fillColor: string, weight: number, opacity: number, color: string, fillOpacity: number }
        fn = (feature: any) => {
            const getColor = (d: math.BigNumber) => {
                return (
                    d > this.threshold[3] ? this.color[3] :
                        d > this.threshold[2] ? this.color[2] :
                            d > this.threshold[1] ? this.color[1] : this.color[0])
            }
            return {
                fillColor: getColor(feature.properties.stats[0][this.type]),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        }
        return fn
    }

extractDataFromLayer(type: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements') {
    let fn =  (l:any) => {
        let index = Object.keys(l._layers)[0]
        let value = l._layers[index].feature.properties.stats[0][type] 
        return value == null ? 0 : value
    }
    return fn 
    }
}