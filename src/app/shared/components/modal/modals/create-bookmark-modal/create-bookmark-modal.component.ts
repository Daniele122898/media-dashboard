import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ElectronService} from "../../../../../core/services";
import {ModalRef} from "../../../../models/ModalRef";

@Component({
  selector: 'app-create-bookmark-modal',
  templateUrl: './create-bookmark-modal.component.html',
  styleUrls: ['./create-bookmark-modal.component.scss']
})
export class CreateBookmarkModalComponent implements AfterViewInit {

  public description: string;

  @ViewChild('textAreaElement') textAreaElement: ElementRef;

  @HostListener('document:keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Enter') {
      this.onSubmit();
    }
  }

  constructor(
    private modalService: ModalService,
    private electronService: ElectronService,
    private modalRef: ModalRef,
  ) { }

  ngAfterViewInit(): void {
    this.textAreaElement.nativeElement.focus();
  }

  public onClose(): void {
    this.modalService.showModal(false);
  }

  public onSubmit(): void {
    // Validate
    if (!this.description || this.description.trim().length < 3)
      return;

    this.modalRef.submit({description: this.description});
    this.modalService.showModal(false);
  }
}
