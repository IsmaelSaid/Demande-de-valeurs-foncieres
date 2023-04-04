interface localisation {
    "lat": number,
    "long": number
}
export class Commune {
    public get nomCommune(): string {
        return this._nomCommune;
    }
    public set nomCommune(value: string) {
        this._nomCommune = value;
    }
    public get codePostal(): number {
        return this._codePostal;
    }
    public set codePostal(value: number) {
        this._codePostal = value;
    }
    public get localisation(): localisation {
        return this._localisation;
    }
    public set localisation(value: localisation) {
        this._localisation = value;
    }
    public get geometrique(): object {
        return this._geometrique;
    }
    public set geometrique(value: object) {
        this._geometrique = value;
    }
    /**
     * 
     * @param nomCommune 
     * @param codePostal 
     * @param localisation 
     * @param geometrique 
     */
    public constructor(private _nomCommune: string,
        private _codePostal: number,
        private _localisation: localisation,
        private _geometrique: object) {

    }

    public toString(): string {
        return this.nomCommune;
    }
}