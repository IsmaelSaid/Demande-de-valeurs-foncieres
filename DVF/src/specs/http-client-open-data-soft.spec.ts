import { HttpClientODS } from "src/services/http-client-open-data-soft.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Other imports
import { TestBed } from '@angular/core/testing';

describe("test service ODS",()=>{
    let service:HttpClientODS;
    let httpmock: HttpTestingController;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            imports:[HttpClientTestingModule],
            providers:[HttpClientODS]

        });
        service = TestBed.inject(HttpClientODS);
        httpmock = TestBed.inject(HttpTestingController);
    });

    it("should find open data soft url ",()=>{
        expect(service.getOpenDataSoftUrl())
        .toEqual("https://data.regionreunion.com/api/v2/catalog/datasets/");
    })
    
    it("should find commune dataset id ",()=>{
        expect(service.getCommuneDatasetID())
        .toEqual("communes-millesime-france/");
    })
    
    it("should find epci dataset id ",()=>{
        expect(service.getEpciDatasetID())
        .toEqual("intercommunalites-millesime-france/");
    })
    
    it("should find iris dataset id ",()=>{
        expect(service.getIrisDatasetID())
        .toEqual("/assets/iris-millesime-la-reunion.json");
    })
    
    it("should be able to create url for commune dataset",()=>{
        expect(service.createUrl(service.getCommuneDatasetID()))
        .toEqual("https://data.regionreunion.com/api/v2/catalog/datasets/communes-millesime-france/exports/json");
    })
    
    it("should be able to create url for epci dataset",()=>{
        expect(service.createUrl(service.getEpciDatasetID()))
        .toEqual("https://data.regionreunion.com/api/v2/catalog/datasets/intercommunalites-millesime-france/exports/json");
    })
})