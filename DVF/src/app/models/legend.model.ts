
import _ from 'lodash';
import * as math from 'mathjs';
export class Legend {
    color: string[] = []
    data: number[] = []
    threshold;
    type!: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements';

    /**
     * @param layerName - Nom de la couche.
     * @param description - Description textuelle de la couche.
     * @param layer - Couche.
     * @param type - Type de la couche : 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements'.
     * @param decomposition - Décomposition de la couche, contenant les probabilités et les couleurs.
     */
    constructor(public layerName: string, public description: string, layer: any, type: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements', public decomposition: { prob: number[], couleur: string[] }) {
        this.type = type;
        this.color = decomposition.couleur.reverse()
        this.data = _.map(layer.getLayers(), this.extractDataFromLayer(this.type))
        const filteredSequence = this.data.filter(value => value !== 0);
        this.threshold = this.decomposition.prob.map((q) => { return (+math.quantileSeq(filteredSequence, q)) })
        math.max(this.data)
    }
    // Cas particulier pour l'affichage du prix de vente au m2. 
    // Si le lieux possèdent un nombre trop faible de vente, le prix au m2 n'est pas affiché
    /**
     * Retourne une fonction de style pour la couche.
     * @returns Fonction de style pour la couche.
     */
    public getStyler() {
        let fn: (feature: any) => { fillColor: string, weight: number, opacity: number, color: string, fillOpacity: number }
        switch (this.type) {
            // Sélectionne la fonction de style en fonction du type

            case 'prix_m2_median_maisons':
                fn = (feature: any) => {
                    const getColor = (d: number) => {
                        let i = this.threshold.findIndex((value: number) => value > d)
                        let c = i != -1 ? this.color[i] : this.color[this.color.length - 1]
                        return c
                    }
                    return {
                        // Si le nombre de vente de maison est inférrieur à 3 on indique que le prix n'est pas significatif
                        fillColor: (feature.properties.stats[0]["nombre_vente_maisons"] < 3) || (feature.properties.stats[0]["nombre_vente_maisons"] == null) ? "#ffffff" : getColor(feature.properties.stats[0][this.type]),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    };
                }
                break;
            case 'prix_m2_median_appartements':
                // Fonction de style pour le type 'prix_m2_median_appartements'
                fn = (feature: any) => {
                    const getColor = (d: number) => {
                        let i = this.threshold.findIndex((value: number) => value > d)
                        let c = i != -1 ? this.color[i] : this.color[this.color.length - 1]
                        return c
                    }
                    return {
                        // Si le nombre de vente d'appartement est inférrieur à 3 on indique que le prix n'est pas significatif
                        fillColor: (feature.properties.stats[0]["nombre_vente_appartements"] < 3) || (feature.properties.stats[0]["nombre_vente_appartements"] == null) ? "#ffffff" : getColor(feature.properties.stats[0][this.type]),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    };
                }
                break;
            default:
                // Fonction de style par défaut pour les autres types
                fn = (feature: any) => {
                    const getColor = (d: number) => {
                        let i = this.threshold.findIndex((value: number) => value > d)
                        let c = i != -1 ? this.color[i] : this.color[this.color.length - 1]
                        return c
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

    /**
     * Extrait les données spécifiées du type de couche donné.
     * @param type Le type de données à extraire.
     * @returns La fonction d'extraction des données.
     */
    extractDataFromLayer(type: 'nombre_vente_maisons' | 'nombre_vente_appartements' | 'prix_m2_median_maisons' | 'prix_m2_median_appartements') {
        // Si  
        // Définition de la fonction d'extraction des données 
        let fn: (l: any) => any = () => { }
        if (!this.isCurrency()) {
            fn = (l: any) => {
                // Obtention de l'index de la première clé du layer
                let index = Object.keys(l._layers)[0]
                // Obtention de la valeur correspondante au type spécifié
                let value = l._layers[index].feature.properties.stats[0][type]
                // Si la valeur est null, elle est remplacée par 0
                return value == null ? 0 : value
            }
        } else {
            switch (this.type) {
                case 'prix_m2_median_maisons':
                    fn = (l: any) => {
                        // Obtention de l'index de la première clé du layer
                        let index = Object.keys(l._layers)[0]
                        // Obtention de la valeur correspondante au type spécifié
                        let value = l._layers[index].feature.properties.stats[0]['nombre_vente_maisons'] < 3 ? null : l._layers[index].feature.properties.stats[0][type]
                        // Si la valeur est null, elle est remplacée par 0
                        return value == null ? 0 : value
                    }
                    break;
                case 'prix_m2_median_appartements':
                    fn = (l: any) => {
                        // Obtention de l'index de la première clé du layer
                        let index = Object.keys(l._layers)[0]
                        // Obtention de la valeur correspondante au type spécifié
                        // Le prix du m2 sur moin de deux ventes n'a pas de sens
                        let value = l._layers[index].feature.properties.stats[0]['nombre_vente_appartements'] < 3 ? null : l._layers[index].feature.properties.stats[0][type]
                        // Si la valeur est null, elle est remplacée par 0
                        return value == null ? 0 : value
                    }
            }
        }
        return fn
    }

    /**
     * Vérifie si le type de données correspond à une valeur monétaire.
     * @returns Une valeur booléenne indiquant si le type de données est une valeur monétaire.
     */
    isCurrency(): boolean {
        // Vérifie si le type est 'prix_m2_median_maisons' ou 'prix_m2_median_appartements'
        return this.type == 'prix_m2_median_maisons' || this.type == 'prix_m2_median_appartements';
    }

    getMax(): number {
        let filteredData = this.data.filter((value)=>{return value != 0})
        return math.max(filteredData)
    }
    getMin(): number {
        let filteredData = this.data.filter((value)=>{return value != 0})
        return math.min(filteredData)
    }
}