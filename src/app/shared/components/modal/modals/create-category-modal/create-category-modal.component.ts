import {Component, OnInit} from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ElectronService} from "../../../../../core/services";
import {DIALOG_EVENT_CHANNEL} from "../../../../../../../shared/models/EventChannels";
import {
  DialogEventData,
  DialogEventOpenReply,
  DialogType,
  SelectionType
} from "../../../../../../../shared/models/dialogEventData";
import {faFolderOpen} from '@fortawesome/free-solid-svg-icons';
import {first} from "rxjs/operators";
import {ModalRef} from "../../../../models/ModalRef";

@Component({
  selector: 'app-create-category-modal',
  templateUrl: './create-category-modal.component.html',
  styleUrls: ['./create-category-modal.component.scss']
})
export class CreateCategoryModalComponent implements OnInit {

  public faFolderOpen = faFolderOpen;

  public filePath: string;
  public categoryName: string;

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

  public onSelectPath(): void {
    this.electronService.invokeHandler<DialogEventOpenReply>(
      DIALOG_EVENT_CHANNEL,
      <DialogEventData>{
        selectionType: SelectionType.Directory,
        dialogType: DialogType.Open,
        allowMultiSelection: false,
        title: 'Choose Folder for Category',
        buttonLabel: 'Choose Folder'
      })
      .pipe(first())
      .subscribe(
        (res) => {
          if (res.canceled)
            return;

          const path = res.filePaths[0];
          if (!path)
            return;

          this.filePath = path;

          if (!this.categoryName && this.filePath) {
            const lastIndex = Math.max(this.filePath.lastIndexOf('/'), this.filePath.lastIndexOf('\\'));
            this.categoryName = this.filePath.substring(lastIndex + 1);
          }
        }, err => {
          console.error(err);
        }
      )
  }

  public onSubmit(): void {
    this.modalRef.submit(this.filePath);
  }
}
