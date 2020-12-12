import {ComponentRef} from "@angular/core";
import {ModalComponent} from "../components/modal/modal.component";
import {Observable, Subject} from "rxjs";

export class ModalConfig {
  data?: any;
  header?: string;
  footer?: string;
  width?: string;
  height?: string;
  closeOnEscape?: boolean;
  baseZIndex?: number = 9000;
  autoZIndex?: boolean;
  modalRef: ModalRef;
  style?: any;
  contentStyle?: any;
  styleClass?: string;
  transitionOptions?: string;
  closable?: boolean = true;
  showHeader?: boolean = true;

  constructor(config?: Partial<ModalConfig>) {
    return Object.assign(this, config);
  }

  getData(prop: string): any {
    return (this.data && this.data.hasOwnProperty(prop)) ? this.data[prop] : undefined;
  }
}

export class ModalRef {
  public componentRef: ComponentRef<ModalComponent>;

  private readonly _onClose = new Subject<any>();

  constructor() { }

  close(result?: any) {
    this._onClose.next(result);
  }

  onClose: Observable<any> = this._onClose.asObservable();
}
