import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {faArrowUp, faFolder} from '@fortawesome/free-solid-svg-icons';
import {ElectronService} from "../../../core/services";
import {Dirent} from "fs";

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  public faArrowUp = faArrowUp;
  public faFolder = faFolder;
  public contentSearchString = "";

  public directories: Dirent[];
  public files: Dirent[];

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

    for (let i = categoryPath.length; i<pathContents.length; ++i) {
      dispPath.push(pathContents[i]);
    }
    this.displayPath = dispPath;
  }

  private _currentPath: string;

  public displayPath: string[];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private electronService: ElectronService,
  ) { }

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

  private getAllFilesInDir(): void {
    const fs = this.electronService.fs;

    fs.readdir(this.currentPath, {withFileTypes: true, encoding: "utf8"}, (err, contents: Dirent[]) => {
      console.log('readDir Error', err);
      console.log('readDir contents', contents);

      this.directories = contents.filter(x=> x.isDirectory());
      const files = contents.filter(x => x.isFile());

      this.changeDetector.detectChanges();
    });
  }

  private replaceBackslash(path: string): string {
    return path.replace(new RegExp("\\\\", "g"), '/')
  }
}
