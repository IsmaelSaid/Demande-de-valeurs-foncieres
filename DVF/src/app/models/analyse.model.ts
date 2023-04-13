import * as vega from 'vega';
import { Config, compile } from 'vega-lite';
import { TopLevelSpec } from 'vega-lite/build/src/spec';
import { CONFIGVEGA } from '../configuration/config.vega';


export abstract class Analyse {
    public get config(): Config {
        return this._config;
    }
    public set config(value: Config) {
        this._config = value;
    }
    public get schema(): string {
        return this._schema;
    }
    public set schema(value: string) {
        this._schema = value;
    }
    
    private _schema: string;
    private _config: Config;
    private _xType: string | undefined;
    private _xField: string | undefined;
    private _yField: string | undefined;
    private _yType: string | undefined;
    private _colorField: string | undefined;
    private _colorType: string | undefined;
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


    constructor(public nomAnalyse: string){
        this._schema = CONFIGVEGA.schema;
        this._config = <Config> CONFIGVEGA.theme;
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

    createVegaView(): void {
        this.appendDiv()
        const vegaSpec = compile(this.createSpec(), { config: this.getConfig() }).spec;
        new vega.View(vega.parse(vegaSpec)).renderer('canvas').initialize('#' + this.nomAnalyse).run();
    }
}
