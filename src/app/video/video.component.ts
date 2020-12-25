import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {ElectronService} from "../core/services";
import {faBookmark, faEye, faEyeSlash, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {faBookmark as faBookmarkLight} from '@fortawesome/free-regular-svg-icons';
import videojs from 'video.js';
import {HASH_FILE_EVENT} from "../../../shared/models/EventChannels";
import {first} from "rxjs/operators";


@Component({
  selector: 'app-detail',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  public faBookmark = faBookmark;
  public faBookmarkLight = faBookmarkLight;
  public faChevronLeft = faChevronLeft;
  public faEye = faEye;
  public faEyeSlash = faEyeSlash;

  public filePath: string;
  public fileType: string;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private electronService: ElectronService,
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

  onVideoInitialLoad(player: videojs.Player) {
    this.electronService.invokeHandler<string>(HASH_FILE_EVENT, {path: this.filePath})
      .pipe(first())
      .subscribe(
        (hash) => {
          if (!hash) {
            console.error('Failed getting hash for file');
            return;
          }

          console.log('GOT FILE HASH', hash);
        },
        err => console.error(err)
      );
  }
}
