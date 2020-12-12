import {ComponentFactoryResolver, ComponentRef, Injectable, Injector, Type} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModalConfig, ModalRef} from "../models/ModalConfig";
import {DynamicInjector} from "../injectors/dynamic.injector";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private contentSubj = new BehaviorSubject<ComponentRef<any>>(null);
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
    if (config.modalRef)
      config.modalRef.close();

    config = new ModalConfig(Object.assign({}, config));

    // Create extended dependency injection for our created modal
    const map = new WeakMap();
    map.set(ModalConfig, config);
    const modalRef = new ModalRef();
    map.set(ModalRef, modalRef);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = componentFactory.create(new DynamicInjector(this.injector, map))

    this.contentSubj.next(componentRef);

    return modalRef;
  }
}
