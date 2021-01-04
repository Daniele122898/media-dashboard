import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ElectronService} from "../../../../../core/services";
import {ModalRef} from "../../../../models/ModalRef";

@Component({
  selector: 'app-create-bookmark-modal',
  templateUrl: './create-bookmark-modal.component.html',
  styleUrls: ['./create-bookmark-modal.component.scss']
})
export class CreateBookmarkModalComponent implements OnInit {

  public description: string;

  constructor(
    private modalService: ModalService,
    private electronService: ElectronService,
    private modalRef: ModalRef,
  ) { }

  ngOnInit(): void {
  }

  public onClose(): void {
    this.modalService.showModal(false);
  }

  public onSubmit(): void {
    // Validate
    if (!this.description)
      return;

    this.modalRef.submit({description: this.description});
    this.modalService.showModal(false);
  }

}
