import {ModalRef} from "./ModalRef";

export class ModalConfig {
  data?: any;
  header?: string;
  subheader?: string;
  footer?: string;
  width?: string;
  height?: string;
  closeOnEscape?: boolean = true;
  baseZIndex?: number = 9000;
  autoZIndex?: boolean;
  modalRef: ModalRef;
  style?: any;
  contentStyle?: any;
  styleClass?: string;
  transitionOptions?: string;
  closable?: boolean = true;
  showHeader?: boolean = false;

  constructor(config?: Partial<ModalConfig>) {
    return Object.assign(this, config);
  }

  getData(prop: string): any {
    return (this.data && this.data.hasOwnProperty(prop)) ? this.data[prop] : undefined;
  }
}
