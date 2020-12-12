import {ComponentRef} from "@angular/core";
import {ModalConfig} from "./ModalConfig";
import {ModalRef} from "./ModalRef";

export interface ModalData {
  componentRef: ComponentRef<any>;
  modalConfig: ModalConfig;
  modalRef: ModalRef;
}
