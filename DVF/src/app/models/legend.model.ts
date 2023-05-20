
import _ from 'lodash';
import * as math from 'mathjs';
export class Legend {
    color: string[] = []
    data: number[] = []
    threshold;
    quartil = [0.25, 0.5, 0.75]
    type!: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements';
    constructor(public layerName: string,public description : string, layer: any,type: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements') {
        this.type = type;
        this.color = ['#cb181d', '#fb6a4a', '#fcae91', '#fee5d9'].reverse()
        this.data = _.map(layer.getLayers(), this.extractDataFromLayer(this.type))
        const filteredSequence = this.data.filter(value => value !== 0);
        this.threshold = this.quartil.map((q) => { return (+math.quantileSeq(filteredSequence, q)) })
    }
    // Cas particulier pour l'affichage du prix de vente au m2. 
    // Si le lieux possèdent un nombre trop faible de vente, le prix au m2 n'est pas affiché
    public getStyler() {
        let fn: (feature: any) => { fillColor: string, weight: number, opacity: number, color: string, fillOpacity: number }
        switch (this.type) {
            case 'prix_m2_median_maisons':
                fn = (feature: any) => {
                    const getColor = (d: number) => {
                        return (
                            d > this.threshold[2] ? this.color[3] :
                                d > this.threshold[1] ? this.color[2] :
                                    d > this.threshold[0] ? this.color[1] :
                                        this.color[0])
                    }
                    return {
                        // Si le nombre de vente de maison est inférrieur à 3 on indique que le prix n'est pas significatif
                        fillColor:(feature.properties.stats[0]["nombre_vente_maisons"] < 3) || (feature.properties.stats[0]["nombre_vente_maisons"] == null) ? "#ffffff" :getColor(feature.properties.stats[0][this.type]),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    };
                }
                break;
            case 'prix_m2_median_appartements':
                fn = (feature: any) => {
                    const getColor = (d: number) => {
                        return (
                            d > this.threshold[2] ? this.color[3] :
                                d > this.threshold[1] ? this.color[2] :
                                    d > this.threshold[0] ? this.color[1] :
                                        this.color[0])
                    }
                    return {
                        // Si le nombre de vente d'appartement est inférrieur à 3 on indique que le prix n'est pas significatif
                        fillColor:(feature.properties.stats[0]["nombre_vente_appartements"] < 3) || (feature.properties.stats[0]["nombre_vente_appartements"] == null) ? "#ffffff" : getColor(feature.properties.stats[0][this.type]),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    };
                }
                break;
            default :
            fn = (feature: any) => {
                const getColor = (d: number) => {
                    return (
                        d > this.threshold[2] ? this.color[3] :
                            d > this.threshold[1] ? this.color[2] :
                                d > this.threshold[0] ? this.color[1] :
                                    this.color[0])
                }
                return {
                    fillColor: getColor(feature.properties.stats[0][this.type]),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.5
                };
            }          
        }
        return fn;
    }

    extractDataFromLayer(type: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements') {
        let fn = (l: any) => {
            let index = Object.keys(l._layers)[0]
            let value = l._layers[index].feature.properties.stats[0][type]
            return value == null ? 0 : value
        }
        return fn
    }

    isCurrency() : boolean {
        return this.type == 'prix_m2_median_maisons' || this.type == 'prix_m2_median_appartements';
    }
}