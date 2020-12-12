import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private contentSubj = new BehaviorSubject<any>(null);
  public Content$ = this.contentSubj.asObservable();

  private displaySubj = new BehaviorSubject<boolean>(false);
  public ShowModal$ = this.displaySubj.asObservable();

  constructor() { }

  public modalContent(content: any): void {
    this.contentSubj.next(content);
  }

  public showModal(show: boolean): void {
    this.displaySubj.next(show);
  }
}
