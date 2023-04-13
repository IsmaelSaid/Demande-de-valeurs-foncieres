import { AnalyseBar } from "src/app/models/analyse-bar-plot.model";
import { AnalyseLinePlot } from "src/app/models/analyse-line-plot.model";
import { AnalysePiePlot } from "src/app/models/analyse-pie-plot.model";

let analyse: AnalyseLinePlot
let dataURL: string, nomAnalyse : string, xField : string, xType : string ;
let colorField : string, colorType: string, thetaAgregate : string, thetaField:string ;
let yField : string , yType : string;
dataURL = "http://localhost:8080/api/global/vente/";
nomAnalyse = "annalyse";
colorField = "quantitative";
colorType = "type";
xField = "anneemut";
xType = "ordinal";
yField = "ordinal";
yType = "nombre";
thetaAgregate = "mean";
thetaField = "nombre";

describe("test lineplot", () => {
    beforeEach(() => {
        analyse = new AnalyseLinePlot(nomAnalyse, dataURL, xField,xType, yField, yType, colorField, colorType);
    });
    
    it("Should be able retrieve arguments",()=>{
        expect(analyse.nomAnalyse).toBe(nomAnalyse);
        expect(analyse.xField).toBe(xField)
        expect(analyse.xType).toBe(xType)
        expect(analyse.yField).toBe(yField)
        expect(analyse.yType).toBe(yType)
        expect(analyse.colorField).toBe(colorField)
        expect(analyse.colorType).toBe(colorType)
    });
    it("shoud be able to interact with the dom",()=>{
        fail("Implementer test d'interaction avec le DOM");
    });
})

describe("test barplot", () => {
    beforeEach(() => {
        analyse = new AnalyseBar(nomAnalyse, dataURL, xField,xType, yField, yType, colorField, colorType);
    });
    it("Should be able retrieve arguments",()=>{
        expect(analyse.nomAnalyse).toBe(nomAnalyse);
        expect(analyse.xField).toBe(xField)
        expect(analyse.xType).toBe(xType)
        expect(analyse.yField).toBe(yField)
        expect(analyse.yType).toBe(yType)
        expect(analyse.colorField).toBe(colorField)
        expect(analyse.colorType).toBe(colorType)
    });

    it("shoud be able to interact with the dom",()=>{
        fail("Implementer test d'interaction avec le DOM");
    });
})

describe("test pieplot", () => {
    beforeEach(() => {
        analyse = new AnalysePiePlot(nomAnalyse, dataURL, colorField,colorType,thetaAgregate,thetaField);
    });
    it("Should be able retrieve arguments",()=>{
        expect(analyse.nomAnalyse).toBe(nomAnalyse);
        expect(analyse.colorField).toBe(colorField);
        expect(analyse.colorType).toBe(colorType);
        expect(analyse.thetaAgregate).toBe(thetaAgregate);
    })

    it("shoud be able to interact with the dom",()=>{
        fail("Implementer test d'interaction avec le DOM");
    });
})
