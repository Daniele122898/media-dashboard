import {ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {faArrowUp, faFolder, faFilm, faSpinner} from '@fortawesome/free-solid-svg-icons';
import {ElectronService} from "../../../core/services";
import {Dirent} from "fs";
import {Router} from "@angular/router";
import {MultiHashEventData, MultiHashResponse} from "../../../../../shared/models/fileEventData";
import {HASH_FILES_EVENT} from "../../../../../shared/models/EventChannels";
import {Subscription} from "rxjs";

interface VideoDirent extends Dirent {
  Finished?: boolean;
  LastTimeStamp?: number;
  Duration?: number;
}

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit, OnDestroy {

  public faArrowUp = faArrowUp;
  public faFolder = faFolder;
  public faSpinner = faSpinner;
  public faFilm = faFilm;
  public contentSearchString = "";

  public directories: Dirent[];
  public files: Dirent[];
  public videos: VideoDirent[];

  public loadingText: string;
  private lastHashSubscription: Subscription;

  @Input('categoryDirPath')
  get categoryDirPath(): string {
    return this._categoryDirPath;
  }

  set categoryDirPath(val: string) {
    if (val) {
      val = this.replaceBackslash(val);
    }
    this._categoryDirPath = val;
    this.currentPath = val;
    this.changeDetector.detectChanges();
  }

  private _categoryDirPath: string;

  get currentPath(): string {
    return this._currentPath;
  }

  set currentPath(val: string) {
    this.directories = null;
    this.files = null

    this._currentPath = val;
    if (!val) {
      this.displayPath = [];
      return;
    }

    this.getAllFilesInDir();

    const pathContents = this.currentPath.split('/');
    const categoryPath = this.categoryDirPath.split('/');

    let dispPath = [categoryPath[categoryPath.length - 1]];
    if (pathContents.length === categoryPath.length) {
      this.displayPath = dispPath;
      return;
    }

    for (let i = categoryPath.length; i < pathContents.length; ++i) {
      dispPath.push(pathContents[i]);
    }
    this.displayPath = dispPath;
  }

  private _currentPath: string;

  public displayPath: string[];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private electronService: ElectronService,
    private router: Router,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
  }

  public shortDisplayPath(pathSegment: string): string {
    if (pathSegment.length <= 20) {
      return pathSegment;
    }

    return `${pathSegment.substr(0, 20)}...`;
  }

  public onOpenDir(dir: Dirent): void {
    const path = this.electronService.path;
    this.currentPath = this.replaceBackslash(path.join(this.currentPath, dir.name));
  }

  public onGoDirUp(): void {
    const path = this.electronService.path;
    if (this.currentPath.length === this.categoryDirPath.length) {
      return;
    }

    let newPath = path.join(this.currentPath, "../");
    const lastChar = newPath.slice(-1);
    if (lastChar === '\\' || lastChar === '/')
      newPath = newPath.slice(0, -1);
    this.currentPath = this.replaceBackslash(newPath);
  }

  public onOpenFileLocation(): void {
    this.electronService.openFileLocation(this.currentPath);
  }

  public onVideo(vid: Dirent): void {
    const path = this.electronService.path;
    const filePath = path.join(this.currentPath, vid.name);
    this.ngZone.run(() => {
      this.router.navigate(['/video'], {
        queryParams: {
          filePath: btoa(filePath)
        }
      })
    })
  }

  private getAllFilesInDir(): void {
    const fs = this.electronService.fs;

    fs.readdir(this.currentPath, {withFileTypes: true, encoding: "utf8"}, (err, contents: Dirent[]) => {

      if (!contents || contents.length === 0)
        return;

      this.directories = contents.filter(x => x.isDirectory());
      const files = contents.filter(x => x.isFile());
      this.videos = files.filter(x => this.isVideo(x.name));
      console.log('VIDEOS: ', this.videos);

      const path = this.electronService.path;
      this.loadingText = 'Indexing Files...'
      this.changeDetector.detectChanges();
      // Check all the hashes and DB :)
      if (this.lastHashSubscription)
        this.lastHashSubscription.unsubscribe();

      this.lastHashSubscription = this.electronService.invokeHandler<MultiHashResponse[], MultiHashEventData>(
        HASH_FILES_EVENT,
        {
          paths: this.videos.map(v => path.join(this.currentPath, v.name))
        }
      ).subscribe(
        hashes => {
          console.log('Received hashes', hashes);
          this.videos.map(v => {
            const h = hashes.find(h => h.path === path.join(this.currentPath, v.name));
            v.Duration = 999;
          });
          this.loadingText = null;
          this.changeDetector.detectChanges();
        }, err => {
          this.loadingText = null;
          this.changeDetector.detectChanges();
          console.error(err);
        }
      )

    });
  }

  private replaceBackslash(path: string): string {
    return path.replace(new RegExp("\\\\", "g"), '/')
  }

  private isVideo(path: string): boolean {
    const parsed = this.electronService.path.parse(path);
    return parsed.ext === '.mp4' || parsed.ext === '.mkv' || parsed.ext === '.webm';
  }

  ngOnDestroy(): void {
    this.lastHashSubscription.unsubscribe();
  }
}
