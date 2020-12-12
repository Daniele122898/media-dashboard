import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ModalInjectorDirective} from "../../directives/modal-injector.directive";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, AfterViewInit ,OnDestroy {

  @ViewChild(ModalInjectorDirective, {static: true}) modalContent: ModalInjectorDirective;

  private static readonly CLOSE_COOLDOWN_MS = 200;

  @HostListener('document:click', ['$event']) onDomClick(e: any): void {
    // if (!this.modalContentNative.contains(e.target) && this.showModal && (Date.now() - this.lastShow > ModalComponent.CLOSE_COOLDOWN_MS)) {
    //   this.modalService.showModal(false);
    // }
  }

  @HostListener('document:keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
    if (Math.abs(Date.now() - this.lastShow) < ModalComponent.CLOSE_COOLDOWN_MS)
      return;

    switch (e.code) {
      case 'Escape':
        this.modalService.showModal(false);
        break;
      default:
        return;
    }
  }

  public showModal = false;
  public content: any;

  private lastShow = Date.now();

  private destroy$ = new Subject();

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.setupModalSubscriptions();
  }

  public ngAfterViewInit(): void {

  }

  private setupModalSubscriptions(): void {
    this.modalService.ShowModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (show) => {
          this.showModal = show;
          if (this.showModal)
            this.lastShow = Date.now();
          console.log('Show modal: ', this.showModal)
        }, err => {
          console.error(err);
        }
      )

    this.modalService.Content$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (content) => {
          // Bind component ref
          const viewRef = this.modalContent.viewContainerRef;
          viewRef.clear();
          viewRef.insert(content.hostView);

          // this.content = content;
          console.log('Modal content: ', this.content)
        }, err => {
          console.error(err);
        }
      )
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
