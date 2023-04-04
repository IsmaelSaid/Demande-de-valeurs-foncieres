import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CONFIG } from 'src/app/configuration/config';

@Injectable({
  providedIn: 'root'
})
export class PgsqlBack {
  constructor(private http: HttpClient) { }

  get(){
    return this.http.get("https://dvfapp.fly.dev/countMutations")
  }
}
