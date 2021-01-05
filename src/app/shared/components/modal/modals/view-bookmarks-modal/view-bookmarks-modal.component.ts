import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ModalRef} from "../../../../models/ModalRef";

@Component({
  selector: 'app-view-bookmarks-modal',
  templateUrl: './view-bookmarks-modal.component.html',
  styleUrls: ['./view-bookmarks-modal.component.scss']
})
export class ViewBookmarksModalComponent implements OnInit {
  bookmarkSearchString: string;

  constructor(
    private modalService: ModalService,
    private modalRef: ModalRef,
  ) { }

  ngOnInit(): void {

  }

  public onClose(): void {
    this.modalService.showModal(false);
  }

}
