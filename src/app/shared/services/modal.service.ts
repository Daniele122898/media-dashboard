import {ComponentFactoryResolver, Injectable, Injector, Type} from '@angular/core';
import {AsyncSubject, BehaviorSubject, ReplaySubject} from "rxjs";
import {ModalConfig} from "../models/ModalConfig";
import {DynamicInjector} from "../injectors/dynamic.injector";
import {ModalData} from "../models/ModalData";
import {ModalDataSubmission} from "../models/ModalDataSubmission";
import {ModalRef} from "../models/ModalRef";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private contentSubj = new BehaviorSubject<ModalData>(null);
  public Content$ = this.contentSubj.asObservable();

  private displaySubj = new BehaviorSubject<boolean>(false);
  public ShowModal$ = this.displaySubj.asObservable();


  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) { }

  public showModal(show: boolean): void {
    this.displaySubj.next(show);
  }

  public createModal(componentType: Type<any>, config: Partial<ModalConfig> = {}): ModalRef {
    // Create extended dependency injection for our created modal
    const map = new WeakMap();
    const modalConfig = new ModalConfig(Object.assign(config, ))
    map.set(ModalConfig, modalConfig);
    const modalRef = new ModalRef();
    map.set(ModalRef, modalRef);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = componentFactory.create(new DynamicInjector(this.injector, map))

    this.contentSubj.next({componentRef, modalConfig});

    return modalRef;
  }
}
