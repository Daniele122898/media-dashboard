import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ModalRef} from "../../../../models/ModalRef";
import {ModalConfig} from "../../../../models/ModalConfig";
import {DatabaseService} from "../../../../services/database.service";
import {Bookmark} from "../../../../models/Bookmark";

export interface BookmarkModalData {
  isFile: boolean;
  fileData?: BookmarkModalFileData;
  categoryData?: BookmarkModalCategoryData;
}

export interface BookmarkModalFileData {
  fileId: number;
  currentTimestamp: number;
}

export interface BookmarkModalCategoryData {
  categoryId: number;
  dirPath: string;
}

@Component({
  selector: 'app-view-bookmarks-modal',
  templateUrl: './view-bookmarks-modal.component.html',
  styleUrls: ['./view-bookmarks-modal.component.scss']
})
export class ViewBookmarksModalComponent implements OnInit {
  public bookmarkSearchString: string;

  public bookmarks: Bookmark[];
  public relevantBookmarks: Bookmark[];

  private config: BookmarkModalData;

  constructor(
    private modalService: ModalService,
    private modalRef: ModalRef,
    private modalConfig: ModalConfig,
    private db: DatabaseService,
    private changeDetection: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.config = <BookmarkModalData>this.modalConfig.data;

    if (this.config.isFile) {
      this.getFileBookmarks();
    } else {
      this.getCategoryBookmarks();
    }
  }

  private getFileBookmarks(): void {
    this.db.getBookmarksWithFileId(this.config.fileData.fileId)
      .subscribe(
        bookmarks => {
          this.bookmarks = bookmarks.sort((a, b) =>
            a.Timestamp > b.Timestamp ? 1 : -1);

          // Get the relevant bookmarks
          // this function returns all bookmarks that are around our current
          // position. So basically 3 bookmarks closest to the current time
          const closestTimestampIndex = ViewBookmarksModalComponent.getClosestTimestampIndex(this.bookmarks, this.config.fileData.currentTimestamp);

          // Now get the ones around
          this.relevantBookmarks = [];
          this.relevantBookmarks.push(this.bookmarks[closestTimestampIndex]);
          if (closestTimestampIndex !== 0)
            this.relevantBookmarks.push(this.bookmarks[closestTimestampIndex-1]);
          if (closestTimestampIndex + 1 !== this.bookmarks.length)
            this.relevantBookmarks.push(this.bookmarks[closestTimestampIndex+1]);

          this.changeDetection.detectChanges();
        }, (err) => console.error(err)
      );
  }

  private static getClosestTimestampIndex(bookmarks: Bookmark[], currentTimestamp: number): number {
    let closest = Number.MAX_SAFE_INTEGER;
    let index = 0;
    for (let i = 0; i<bookmarks.length; ++i) {
      const b = bookmarks[i];
      const dist = Math.abs(currentTimestamp - b.Timestamp);
      if (closest > dist) {
        closest = dist;
        index = i;
      } else if (closest < dist) {
        // we're now moving away from our current position and FARTHER than our closest
        break;
      }
    }
    return index;
  }

  private getCategoryBookmarks(): void {

  }

  public onClose(): void {
    this.modalService.showModal(false);
  }

}
