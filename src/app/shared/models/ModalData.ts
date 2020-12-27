import {ComponentRef} from "@angular/core";
import {ModalConfig} from "./ModalConfig";

export interface ModalData {
  componentRef: ComponentRef<any>;
  modalConfig: ModalConfig;
}
