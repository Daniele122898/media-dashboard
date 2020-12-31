import {ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {faArrowUp, faFolder, faFilm, faSpinner, faEye} from '@fortawesome/free-solid-svg-icons';
import {ElectronService} from "../../../core/services";
import {Dirent} from "fs";
import {Router} from "@angular/router";
import {MultiHashEventData, MultiHashResponse} from "../../../../../shared/models/fileEventData";
import {GET_FILEIDS_EVENT} from "../../../../../shared/models/EventChannels";
import {Subscription} from "rxjs";
import {DatabaseService} from "../../../shared/services/database.service";
import {LastExplorerStateService} from "../../services/last-explorer-state.service";

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
  public faEye = faEye;

  public contentSearchString = "";

  public directories: Dirent[];
  public videos: VideoDirent[];

  public loadingText: string;
  private lastHashSubscription: Subscription;

  @Input('categoryDirPath')
  get categoryDirPath(): string {
    return this._categoryDirPath;
  }

  set categoryDirPath(val: string) {
    let replaced = val;
    if (val) {
      replaced = this.replaceBackslash(val);
    }
    this._categoryDirPath = replaced;

    if (this.explorerStateService.lastSelectedCategory?.DirPath === val) {
      this.currentPath = this.explorerStateService.lastCurrentPath ?
        this.explorerStateService.lastCurrentPath : replaced;
    }

    this.changeDetector.detectChanges();
  }

  private _categoryDirPath: string;

  get currentPath(): string {
    return this._currentPath;
  }

  set currentPath(val: string) {
    this.directories = null;

    this._currentPath = val;
    this.explorerStateService.lastCurrentPath = val;

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
    private db: DatabaseService,
    private explorerStateService: LastExplorerStateService,
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
    if (!this.currentPath)
      return;
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

  // TODO Rework search - This is very slow and just overall a very bad implementation
  // It's not as pressing because the search is quick enough and in memory but it's still a very bad way of doing things
  // Since this method is called VERY OFTEN by angular. Actually each time anything calls for a detectChanges.
  public getFilteredDirectoryList(): Dirent[] {
    if (!this.contentSearchString)
      return this.directories;

    const search = this.contentSearchString.toLowerCase();
    return this.directories.filter(x => x.name.toLowerCase().includes(search));
  }

  // TODO Rework search - This is very slow and just overall a very bad implementation
  // It's not as pressing because the search is quick enough and in memory but it's still a very bad way of doing things
  // Since this method is called VERY OFTEN by angular. Actually each time anything calls for a detectChanges.
  public getFilteredVideoList(): VideoDirent[] {
    if (!this.contentSearchString)
      return this.videos;

    const search = this.contentSearchString.toLowerCase();
    return this.videos.filter(x => x.name.toLowerCase().includes(search));
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
      // Check all the fileIDs and DB :)
      if (this.lastHashSubscription)
        this.lastHashSubscription.unsubscribe();

      this.lastHashSubscription = this.electronService.invokeHandler<MultiHashResponse[], MultiHashEventData>(
        GET_FILEIDS_EVENT,
        {
          paths: this.videos.map(v => path.join(this.currentPath, v.name))
        }
      ).subscribe(
        resp => {
          console.log('Received file Ids', resp);

          for (let i = 0; i<this.videos.length; ++i) {
            let v = this.videos[i];
            const fileResp = resp.find(h => h.path === path.join(this.currentPath, v.name));

            this.db.tryGetFileWithFileId(fileResp.fileId)
              .subscribe(
                file => {
                  if (!file)
                    return;

                  v.Finished = file.Finished;
                  v.LastTimeStamp = file.LastTimestamp;
                  v.Duration = file.Duration;
                  this.videos[i] = v;
                  console.log('Added duration for file', file);
                  this.changeDetector.detectChanges();
                }, err => console.error(err)
              )
          }

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
