import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ElectronService} from "../core/services";
import {faFolder, faFolderOpen, faTrash} from '@fortawesome/free-solid-svg-icons';
import {DatabaseService} from "../shared/services/database.service";
import {Category} from "../shared/models/Category";
import {first} from "rxjs/operators";
import {ModalService} from "../shared/services/modal.service";
import {CreateCategoryModalComponent} from "../shared/components/modal/modals/create-category-modal/create-category-modal.component";
import {Subscription} from "rxjs";
import {DialogEventData, DialogType, MessageBoxData, MessageBoxReply} from "../../../shared/models/dialogEventData";
import {DIALOG_EVENT_CHANNEL} from "../../../shared/models/EventChannels";
import {LastExplorerStateService} from "./services/last-explorer-state.service";


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

  public faTrash = faTrash;

  public categories: Category[] = [];
  private modalValueSub: Subscription;

  public selectedCategory: Category;

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private changeDetection: ChangeDetectorRef,
    private db: DatabaseService,
    private modalService: ModalService,
    private explorerStateService: LastExplorerStateService,
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
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


  public onCategoryClick(category: Category): void {
    this.selectedCategory = category;
    this.explorerStateService.lastSelectedCategory = category;
    this.explorerStateService.lastCurrentPath = null;
    this.changeDetection.detectChanges();
  }

  public isSelectedCategory(currCategory: Category): boolean {
    return this.selectedCategory && currCategory.Id == this.selectedCategory.Id;
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

        // Check last selected category!
        if (this.explorerStateService.lastSelectedCategory) {
          const cat = this.categories.find(x => x.DirPath === this.explorerStateService.lastSelectedCategory.DirPath)
          if (cat) {
            this.selectedCategory = cat;
          }
        }

        this.changeDetection.detectChanges();
      }, err => {
        console.error(err);
      });
  }

  ngOnDestroy(): void {
    if (this.modalValueSub) {
      this.modalValueSub.unsubscribe();
    }
  }
}
