import * as vega from 'vega';
import { Config, compile } from 'vega-lite';
import { TopLevelSpec } from 'vega-lite/build/src/spec';
import { CONFIGVEGA } from '../configuration/config.vega';
import { View } from 'vega';


export abstract class Analyse {
    private _schema: string | undefined;
    private _config: Config;
    private _xType: string | undefined;
    private _xField: string | undefined;
    private _yField: string | undefined;
    private _yType: string | undefined;
    private _colorField: string | undefined;
    private _colorType: string | undefined;
    private _elementHtml: HTMLElement | undefined;
    private _vegaspec: vega.Spec | undefined;
    private _vegaview: vega.View | undefined;
    
    public get vegaview(): vega.View | undefined {
        return this._vegaview;
    }
    public set vegaview(value: vega.View | undefined) {
        this._vegaview = value;
    }
    
    public get config(): Config {
        return this._config;
    }
    public set config(value: Config) {
        this._config = value;
    }
    public get schema(): string | undefined{
        return this._schema;
    }
    public set schema(value: string | undefined) {
        this._schema = value;
    }
    

    public get vegaspec(): vega.Spec | undefined {
        return this._vegaspec;
    }
    public set vegaspec(value: vega.Spec | undefined) {
        this._vegaspec = value;
    }

    public get elementHtml(): HTMLElement | undefined {
        return this._elementHtml;
    }
    public set elementHtml(value: HTMLElement | undefined) {
        this._elementHtml = value;
    }
    public get colorType(): string | undefined {
        return this._colorType;
    }
    public set colorType(value: string | undefined) {
        this._colorType = value;
    }
    public get colorField(): string | undefined {
        return this._colorField;
    }
    public set colorField(value: string | undefined) {
        this._colorField = value;
    }
    private _thetaAgregate: string | undefined;
    
    public get xField(): string | undefined {
        return this._xField;
    }
    public set xField(value: string | undefined) {
        this._xField = value;
    }
    public get xType(): string | undefined {
        return this._xType;
    }
    public set xType(value: string | undefined) {
        this._xType = value;
    }
    public get yField(): string | undefined {
        return this._yField;
    }
    public set yField(value: string | undefined) {
        this._yField = value;
    }
    public get yType(): string | undefined {
        return this._yType;
    }
    public set yType(value: string | undefined) {
        this._yType = value;
    }
    public get thetaAgregate(): string | undefined {
        return this._thetaAgregate;
    }
    public set thetaAgregate(value: string | undefined) {
        this._thetaAgregate = value;
    }
    private _thetaField: string | undefined;
    public get thetaField(): string | undefined {
        return this._thetaField;
    }
    public set thetaField(value: string | undefined) {
        this._thetaField = value;
    }


    constructor(public nomAnalyse: string, public titre:string){
        this._schema = CONFIGVEGA.schema;
        this._config = <Config> CONFIGVEGA.theme;
        this._elementHtml = document.createElement("div");
        this._elementHtml.id = nomAnalyse;
        const app = document.getElementById(nomAnalyse);
        app?.append(this._elementHtml);
    }
    abstract createSpec(): TopLevelSpec

    createDiv() {
        const div = document.createElement("div");
        div.id = this.nomAnalyse
        return div
    }

    appendDiv() {
        const app = document.getElementById("analyse");
        app?.append(this.createDiv())
    }
    getConfig(): Config {
        return this._config;

    }

    compileVegaSpec():vega.Spec{
        return compile(this.createSpec(), { config: this.getConfig() }).spec;
    }
    createVegaView(): View {
        this.appendDiv()
        const vegaSpec = compile(this.createSpec(), { config: this.getConfig() }).spec;
        return new vega.View(vega.parse(vegaSpec)).renderer('canvas').initialize('#' + this.nomAnalyse).run();
    }

    destroyView(): void{
        document.getElementById(this.nomAnalyse)?.remove()
    }


    

}
