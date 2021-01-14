import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ModalService} from "../../../../services/modal.service";
import {ModalRef} from "../../../../models/ModalRef";
import {ModalConfig} from "../../../../models/ModalConfig";
import {DatabaseService} from "../../../../services/database.service";
import {Bookmark} from "../../../../models/Bookmark";
import {faTrash, faCompressArrowsAlt} from '@fortawesome/free-solid-svg-icons';
import {BookmarkModalData, BookmarkModalResponse, ExtendedBookmark} from "../../../../models/BookmarkModal";

@Component({
  selector: 'app-view-bookmarks-modal',
  templateUrl: './view-bookmarks-modal.component.html',
  styleUrls: ['./view-bookmarks-modal.component.scss']
})
export class ViewBookmarksModalComponent implements OnInit {
  public bookmarkSearchString: string;

  public faTrash = faTrash;
  public faCompressArrowsAlt = faCompressArrowsAlt;

  public bookmarks: ExtendedBookmark[];
  public relevantBookmarks: ExtendedBookmark[];

  public config: BookmarkModalData;

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

    this.getBookmarks();
  }

  public onClose(): void {
    this.modalService.showModal(false);
  }

  public onJumpClick(b: Bookmark): void {
    this.modalRef.submit(<BookmarkModalResponse>{
      selectedBookmark: b
    });

    this.modalService.showModal(false);
  }

  public getFilteredBookmarkList(): ExtendedBookmark[] {
    const search = this.bookmarkSearchString.toLowerCase();
    return this.bookmarks.filter(x => x.Description.toLowerCase().includes(search));
  }

  public onRemoveClick(b: Bookmark): void {
    console.log('Bookmark to remove', b);
    this.db.removeBookmark(b.Id)
      .subscribe(
        (res) => {
          console.log('SQL result', res);
          if (res.rowsAffected === 0) {
            console.error('Couldn\'t remove bookmark');
            return;
          }

          this.getBookmarks();
        }, (err) => console.error(err)
      );
  }

  public getFilename(b: ExtendedBookmark): string {
    return b.FileDbo.LKPath.substring(b.FileDbo.LKPath.lastIndexOf('/')+1);
  }

  public getTimestamp(b: Bookmark): string {
    let timeStr = new Date(b.Timestamp * 1000).toISOString().substr(11, 8);
    if (timeStr.startsWith('00:'))
      timeStr = timeStr.substr(3);

    return timeStr;
  }

  private getBookmarks(): void {
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
            this.relevantBookmarks.push(this.bookmarks[closestTimestampIndex - 1]);
          if (closestTimestampIndex + 1 !== this.bookmarks.length)
            this.relevantBookmarks.push(this.bookmarks[closestTimestampIndex + 1]);

          this.changeDetection.detectChanges();
        }, (err) => console.error(err)
      );
  }

  private static getClosestTimestampIndex(bookmarks: Bookmark[], currentTimestamp: number): number {
    let closest = Number.MAX_SAFE_INTEGER;
    let index = 0;
    for (let i = 0; i < bookmarks.length; ++i) {
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
    this.config.categoryData.dirPath = this.config.categoryData.dirPath
      .replace(new RegExp("\\\\", "g"), '/')
      .trim();

    this.db.getBookmarksWithCategoryIdOrPath(this.config.categoryData.categoryId, this.config.categoryData.dirPath)
      .subscribe(
        (bookmarks) => {
          this.bookmarks = bookmarks
            .map(x => {
              let b = x;
              b.DirPath = b.DirPath.trim().replace(new RegExp("\\\\", "g"), '/');
              return b;
            })
            .filter(x => x.DirPath.includes(this.config.categoryData.dirPath))
            .sort((a, b) => (a.DirPath.localeCompare(b.DirPath)));

          for (let i=0; i<this.bookmarks.length; ++i) {
            let b = this.bookmarks[i];
            this.db.getFileWithId(b.FileId)
              .subscribe(
                (file) => {
                  file.LKPath = file.LKPath.replace(new RegExp("\\\\", "g"), '/');
                  b.FileDbo = file;
                  this.bookmarks[i] = b;

                  if (i === this.bookmarks.length -1)
                    this.createBookmarkSeparations();
                }, (err) => console.error(err)
              );

          }
        }, (err) => console.error(err)
      );
  }

  private createBookmarkSeparations(): void {
    this.relevantBookmarks = this.bookmarks
      .sort((a,b) => {
        return a.Id < b.Id ? 1 : -1;
      }).slice(0,3);
    this.changeDetection.detectChanges();
  }
}
