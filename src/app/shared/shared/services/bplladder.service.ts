import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LadderEntry } from '../models/ladder-entry';

@Injectable({
  providedIn: 'root'
})
export class BPLLadderService {

  private url = 'https://bpl-backend-rjefe.ondigitalocean.app/ladder/'

  public ladder$: Observable<LadderEntry[]> = this.httpClient.get<LadderEntry[]>(this.url);

  constructor(private httpClient: HttpClient) { }
}
