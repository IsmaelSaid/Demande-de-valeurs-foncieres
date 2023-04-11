import { TestBed } from "@angular/core/testing";
import { PgsqlBack } from "src/services/pgsql-back.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("pgsql backend",()=>{
    let service : PgsqlBack;
    let httpmock: HttpClientTestingModule;
    
    beforeEach(()=>{
        TestBed.configureTestingModule({
            imports : [HttpClientTestingModule],
            providers:[PgsqlBack]
        });
        service = TestBed.inject(PgsqlBack);
        httpmock = TestBed.inject(HttpClientTestingModule);
    });

    it("shoud be truthy",()=>{
        expect(service).toBeTruthy()
    });

})