import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appModalInjector]'
})
export class ModalInjectorDirective {

  constructor(
    public viewContainerRef: ViewContainerRef
  ) { }

}
