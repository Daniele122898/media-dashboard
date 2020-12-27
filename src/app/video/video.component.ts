import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {ElectronService} from "../core/services";
import {faBookmark, faEye, faEyeSlash, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {faBookmark as faBookmarkLight} from '@fortawesome/free-regular-svg-icons';
import videojs from 'video.js';
import {HASH_FILE_EVENT} from "../../../shared/models/EventChannels";
import {first, takeUntil} from "rxjs/operators";
import {DatabaseService} from "../shared/services/database.service";
import {FileDbo} from "../shared/models/FileDbo";
import {interval, Subject} from "rxjs";
import {HashEventData} from "../../../shared/models/fileEventData";


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

  private destroy$  = new Subject();

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private electronService: ElectronService,
    private db: DatabaseService,
    private changeDetection: ChangeDetectorRef,
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

  }

  onVideoInitialLoad(player: videojs.Player) {
    this.electronService.invokeHandler<string, HashEventData>(HASH_FILE_EVENT, {path: this.filePath})
      .pipe(first())
      .subscribe(
        (hash) => {
          if (!hash) {
            console.error('Failed getting hash for file');
            return;
          }

          this.db.tryGetFileWithHash(hash)
            .subscribe(
            fileDbo => {
              if (!fileDbo) {
                // No hash in file so create one
                this.db.insertNewFile({
                  Id: 0,
                  LastTimestamp: 0,
                  Finished: false,
                  LKPath: this.filePath,
                  Md5Hash: hash,
                  Duration: Math.floor(player.duration())
                }).subscribe(
                  res => {
                    if (res.rowsAffected === 0) {
                      console.error('Failed to insert file row')
                      return;
                    }

                    this.fileDbo = {
                      Id: res.insertId,
                      Md5Hash: hash,
                      LKPath: this.filePath,
                      Finished: false,
                      LastTimestamp: 0,
                      Duration: Math.floor(player.duration())
                    }
                    this.setupIntervals(player);
                  },
                  err => console.error(err)
                );
                return;
              }

              // Got file so we can skip
              player.currentTime(Math.floor(fileDbo.LastTimestamp));
              this.fileDbo = fileDbo;

              this.setupIntervals(player);

            }, err => console.error(err)
          )
        },
        err => console.error(err)
      );
  }

  private setupIntervals(player: videojs.Player) {
    interval(3500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentTimestamp = player.currentTime();
        const duration = player.duration();
        let finished = this.fileDbo.Finished;
        if (duration - currentTimestamp < 15 && !finished) {
          finished = true;
        }

        const file: FileDbo = {
          Id: this.fileDbo.Id,
          Md5Hash: this.fileDbo.Md5Hash,
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
