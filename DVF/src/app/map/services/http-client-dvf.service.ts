import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpDVF {
    constructor(private http: HttpClient) { }

    getData() {
        let url = "postgres://postgres:KmEMlADl3kFpPlZ@localhost:5432"
        return this.http.get(url)
    }
}