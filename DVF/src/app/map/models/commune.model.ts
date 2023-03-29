interface localisation {
    "lat": number,
    "long": number
}
export class Commune {
/**
 * 
 * @param nomCommune 
 * @param codePostal 
 * @param localisation 
 * @param geometrique 
 */
    public constructor(public nomCommune: string,
                        public codePostal: number,
                        public localisation: localisation,
                        public geometrique: number) {

    }

    public toString():string{
        return this.nomCommune;
    }
}