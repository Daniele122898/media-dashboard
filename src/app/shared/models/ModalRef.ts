import {ComponentRef} from "@angular/core";
import {ModalComponent} from "../components/modal/modal.component";
import {Observable, Subject} from "rxjs";

export class ModalRef {
  public componentRef: ComponentRef<ModalComponent>;

  private readonly _onClose = new Subject<any>();

  constructor() { }

  close(result?: any) {
    this._onClose.next(result);
  }

  onClose: Observable<any> = this._onClose.asObservable();
}
