import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {ElectronService} from "../core/services";
import {faBookmark, faEye, faEyeSlash, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {faBookmark as faBookmarkLight} from '@fortawesome/free-regular-svg-icons';
import videojs from 'video.js';
import {GET_FILEID_EVENT} from "../../../shared/models/EventChannels";
import {first, takeUntil} from "rxjs/operators";
import {DatabaseService} from "../shared/services/database.service";
import {FileDbo} from "../shared/models/FileDbo";
import {interval, Subject, Subscription} from "rxjs";
import {HashEventData} from "../../../shared/models/fileEventData";
import {ModalService} from "../shared/services/modal.service";
import {CreateBookmarkModalComponent} from "../shared/components/modal/modals/create-bookmark-modal/create-bookmark-modal.component";
import {LastExplorerStateService} from "../shared/services/last-explorer-state.service";
import {Bookmark} from "../shared/models/Bookmark";
import {
  BookmarkModalData,
  ViewBookmarksModalComponent
} from "../shared/components/modal/modals/view-bookmarks-modal/view-bookmarks-modal.component";


@Component({
  selector: 'app-detail',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {
  public faBookmark = faBookmark;
  public faBookmarkLight = faBookmarkLight;
  public faChevronLeft = faChevronLeft;
  public faEye = faEye;
  public faEyeSlash = faEyeSlash;

  public filePath: string;
  public fileType: string;

  public fileDbo: FileDbo;
  public bookmarks: Bookmark[];

  private modalValueSub: Subscription;
  private destroy$ = new Subject();
  private player: videojs.Player;

  @HostListener('document:keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.code === 'KeyB' && !this.modalService.isModalActive()) {
      this.onCreateBookmark();
    }
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private electronService: ElectronService,
    private db: DatabaseService,
    private changeDetection: ChangeDetectorRef,
    private modalService: ModalService,
    private lastExplorerState: LastExplorerStateService,
  ) {
  }

  ngOnInit(): void {
    const filepath = this.route.snapshot.queryParams.filePath;
    if (filepath) {
      this.filePath = atob(filepath);
      const fs = this.electronService.fs;

      if (!fs.existsSync(this.filePath)) {
        console.error("File doesn't exist: ", this.filePath);
        return;
      }

      const fileType = this.electronService.fileType;
      fileType.fromFile(this.filePath)
        .then((res) => {
          if (!res) {
            console.error("Couldn't get file mime")
            return;
          }
          this.fileType = res.mime;
        })
        .catch(e => console.error(e));


    }
  }

  public onBack(): void {
    this.location.back();
  }

  getOptions() {
    return {
      fluid: false,
      aspectRatio: '16:9',
      height: 200,
      autoplay: false,
      controls: true,
      sources: [
        {
          src: `http://localhost:8484/video?filePath=${this.filePath}`,
          type: this.fileType,
        }
      ]
    };
  }

  public onViewBookmarks(): void {
    if (this.modalValueSub)
      this.modalValueSub.unsubscribe();

    // We get the timestamp the moment the user CLICKED the create bookmark function
    const timestamp = Math.floor(this.player.currentTime());
    const paused = this.player.paused();
    // Pause playback
    if (!paused)
      this.player.pause();

    const confData: BookmarkModalData = {
      isFile: true,
      fileData: {
        currentTimestamp: timestamp,
        fileId: this.fileDbo.Id
      }
    }

    const modalRef = this.modalService.createModal(ViewBookmarksModalComponent, {
      showHeader: false,
      style: {padding: 0},
      // width: '400px',
      data: confData,
    });
    this.modalService.showModal(true);

    this.modalValueSub = modalRef.Value$
      .pipe(first())
      .subscribe(
        val => {

        }, err => console.error(err)
      );
  }

  public onMarkWatchedToggle(): void {
    this.fileDbo.Finished = !this.fileDbo.Finished;
    this.db.updateFile(this.fileDbo)
      .subscribe(
        res => {
          if (res.rowsAffected < 0) {
            console.error('Failed to update watched state');
            this.fileDbo.Finished = !this.fileDbo;
            return;
          }

          this.changeDetection.detectChanges();
        }, error => {
          console.error(error);
          this.fileDbo.Finished = !this.fileDbo;
        }
      )
  }

  public onCreateBookmark(): void {
    if (this.modalValueSub)
      this.modalValueSub.unsubscribe();

    // We get the timestamp the moment the user CLICKED the create bookmark function
    const timestamp = Math.floor(this.player.currentTime());
    const paused = this.player.paused();
    // Pause playback
    if (!paused)
      this.player.pause();

    const modalRef = this.modalService.createModal(CreateBookmarkModalComponent, {
      header: 'Create New Bookmark',
      subheader: 'Bookmarks make it easy to find certain spots in your videos. ' +
        'They are timestamped and are bound to the category that you\'re currently and can ' +
        'be searched with the description.',
      showHeader: true,
      width: '400px'
    });
    this.modalService.showModal(true);

    this.modalValueSub = modalRef.Value$
      .pipe(first())
      .subscribe(
        desc => {
          if (!this.lastExplorerState.lastSelectedCategory || !this.lastExplorerState.lastCurrentPath) {
            alert('State incorrect. Please go back and select a category to fix this issue.')
            return;
          }
          const fileId = this.fileDbo.Id;
          const categoryId = this.lastExplorerState.lastSelectedCategory.Id;
          const dirPath = this.lastExplorerState.lastCurrentPath;
          this.db.insertBookmark(fileId, categoryId, dirPath, timestamp, desc.description)
            .subscribe(res => {
              if (res.rowsAffected === 0)
                return;

              this.loadBookmarks();
            }, err => console.error(err));

          if (!paused)
            this.player.play();
        }, err => console.error(err)
      );
  }

  public onVideoInitialLoad(player: videojs.Player) {
    this.player = player;

    this.electronService.invokeHandler<string, HashEventData>(GET_FILEID_EVENT, {path: this.filePath})
      .pipe(first())
      .subscribe(
        (fileId) => {
          if (!fileId) {
            console.error('Failed getting hash for file');
            return;
          }

          this.db.tryGetFileWithFileId(fileId)
            .subscribe(
              fileDbo => {
                if (!fileDbo) {
                  // No hash in file so create one
                  this.db.insertNewFile({
                    Id: 0,
                    LastTimestamp: 0,
                    Finished: false,
                    LKPath: this.filePath,
                    FileId: fileId,
                    Duration: Math.floor(player.duration())
                  }).subscribe(
                    res => {
                      if (res.rowsAffected === 0) {
                        console.error('Failed to insert file row')
                        return;
                      }

                      this.fileDbo = {
                        Id: res.insertId,
                        FileId: fileId,
                        LKPath: this.filePath,
                        Finished: false,
                        LastTimestamp: 0,
                        Duration: Math.floor(player.duration())
                      }
                      this.loadBookmarks();
                      this.setupIntervals(player);
                    },
                    err => console.error(err)
                  );
                  return;
                }

                // Got file so we can skip
                player.currentTime(Math.floor(fileDbo.LastTimestamp));
                this.fileDbo = fileDbo;

                this.loadBookmarks();
                this.setupIntervals(player);

              }, err => console.error(err)
            )
        },
        err => console.error(err)
      );
  }

  private loadBookmarks(): void {
    this.db.getBookmarksWithFileId(this.fileDbo.Id)
      .subscribe(bookmarks => {
        this.bookmarks = bookmarks;
        console.log('Got bookmarks', bookmarks);
      }, err => console.error(err));
  }

  private setupIntervals(player: videojs.Player) {
    interval(3500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentTimestamp = player.currentTime();
        const duration = player.duration();
        let finished = this.fileDbo.Finished;
        if (duration - currentTimestamp < 30 && !finished) {
          finished = true;
        }

        const file: FileDbo = {
          Id: this.fileDbo.Id,
          FileId: this.fileDbo.FileId,
          LKPath: this.filePath,
          Duration: this.fileDbo.Duration,
          LastTimestamp: Math.floor(currentTimestamp),
          Finished: finished
        }

        this.fileDbo = file;

        this.db.updateFile(file).subscribe(
          val => {
            if (val.rowsAffected < 0)
              console.error('Failed updating file db with no error :/');
          }, error => console.error('Failed updating file in db', error)
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
