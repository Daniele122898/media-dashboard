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
  @ViewChild('modalContent', {static: false}) modalContentContainer: ElementRef;

  private static readonly CLOSE_COOLDOWN_MS = 200;
  private modalContentNative: any;

  @HostListener('document:click', ['$event']) onDomClick(e: any): void {
    if (!this.modalContentNative.contains(e.target) && (Date.now() - this.lastShow > ModalComponent.CLOSE_COOLDOWN_MS)) {
      this.modalService.showModal(false);
    }
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

  private lastShow = Date.now();

  private destroy$ = new Subject();

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.setupModalSubscriptions();
  }

  public ngAfterViewInit(): void {
    this.modalContentNative = this.modalContentContainer.nativeElement;
  }

  private setupModalSubscriptions(): void {
    this.modalService.ShowModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (show) => {
          if (show) {
            this.lastShow = Date.now();
          } else {
            this.modalContent.viewContainerRef.clear();
          }
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
          viewRef.insert(content.componentRef.hostView);
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
