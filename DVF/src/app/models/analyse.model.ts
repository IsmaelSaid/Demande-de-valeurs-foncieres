import { Config } from 'vega-lite';
import { CONFIGVEGA } from '../configuration/config.vega';
import { TopLevelSpec } from 'vega-lite/build/src/spec';

export abstract class Analyse {
    config!: Config;
    constructor(public nomAnalyse: string) {
        this.config = <Config>CONFIGVEGA.theme
    }
    abstract createVegaView(): void
    abstract createSpec(): TopLevelSpec
    public createDiv() {
        const app = document.getElementById("analyse");
        const div = document.createElement("div");
        div.id = this.nomAnalyse
        app?.append(div)
    }
    getConfig(): Config {
        return this.config;
    }
}
