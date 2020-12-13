import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ElectronService} from "../core/services";
import {faArrowUp, faFolder, faFolderOpen, faTrash} from '@fortawesome/free-solid-svg-icons';
import {DatabaseService} from "../shared/services/database.service";
import {Category} from "../shared/models/Category";
import {first} from "rxjs/operators";
import {ModalService} from "../shared/services/modal.service";
import {CreateCategoryModalComponent} from "../shared/components/modal/modals/create-category-modal/create-category-modal.component";
import {Subscription} from "rxjs";
import {DialogEventData, DialogType, MessageBoxData, MessageBoxReply} from "../../../shared/models/dialogEventData";
import {DIALOG_EVENT_CHANNEL} from "../../../shared/models/EventChannels";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public sidebarSearchString = "";
  public contentSearchString = "";

  public faFolder = faFolder;
  public faFolderOpen = faFolderOpen;
  public faArrowUp = faArrowUp;
  public faTrash = faTrash;

  public categories: Category[] = [];
  private modalValueSub: Subscription;

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private changeDetection: ChangeDetectorRef,
    private db: DatabaseService,
    private modalService: ModalService,
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
  }

  public sendExampleIpc(): void {
    this.electronService.sendIpcMessage('channel1', {message: 'hello'});
  }

  public openFileLocation(): void {
    this.electronService.openFileLocation('F:\\Coding\\media-dashboard\\_config.yml');
  }

  public onCreateCategory(): void {
    if (this.modalValueSub)
      this.modalValueSub.unsubscribe();

    const modalRef = this.modalService.createModal(CreateCategoryModalComponent, {
      header: 'Create New Category',
      subheader: 'Categories represent Folders on your PC to easily organize your ' +
        'most important media folders.',
      showHeader: true,
      width: '400px'
    });
    this.modalService.showModal(true);

    this.modalValueSub = modalRef.Value$
      .pipe(first())
      .subscribe(
        res => {
          console.log('Got Modal value', res);
          this.db.insertNewCategory(res.categoryName, res.filePath)
            .pipe(first())
            .subscribe(
              res => {
                if (res.rowsAffected > 0) {
                  this.getAllCategories();
                } else {
                  console.error('Something went wrong when inserting!')
                  this.electronService.invokeHandler(
                    DIALOG_EVENT_CHANNEL,
                    <DialogEventData>{
                      dialogType: DialogType.Error,
                      title: 'Something went wrong',
                      content: "Couldn't save new Category :("
                    })
                }
              }, err => console.error(err)
            );
        }, err => console.error(err)
      );

  }

  public removeCategory(category: Category): void {
    this.electronService.invokeHandler<MessageBoxReply>(
      DIALOG_EVENT_CHANNEL,
      <MessageBoxData>{
        type: "question",
        dialogType: DialogType.Messagebox,
        title: 'Are you sure?',
        message: 'Do you really want to remove this category? This will remove all children as well.',
        buttons: ['Yes', 'No'],
        defaultId: 0
      }).pipe(first())
      .subscribe(
        res => {
          if (res.response !== 0)
            return;

          this.db.removeCategory(category.Id)
            .pipe(first())
            .subscribe(
              res => {
                if (res.rowsAffected > 0) {
                  this.getAllCategories();
                } else {
                  this.electronService.invokeHandler(
                    DIALOG_EVENT_CHANNEL,
                    <DialogEventData>{
                      dialogType: DialogType.Error,
                      title: 'Something went wrong',
                      content: "Couldn't remove Category :("
                    })
                }
              }, err => console.error(err)
            )

        }, err => console.error(err)
      )
  }

  private getAllCategories(): void {
    this.db.getAllCategories()
      .pipe(first())
      .subscribe((res) => {
        this.categories = res;
        this.changeDetection.detectChanges();
      }, err => {
        console.error(err);
      });
  }

  ngOnDestroy(): void {
    this.modalValueSub.unsubscribe();
  }
}
