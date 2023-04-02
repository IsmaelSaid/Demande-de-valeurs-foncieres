interface TypeAnalyse {
    niveau:string,
    entite:string,
}

export class Analyse{
    constructor(public nomAnalyse:string, public precision:string, public entite:string){}
}