import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {faArrowUp} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  public faArrowUp = faArrowUp;
  public contentSearchString = "";

  @Input('categoryDirPath')
  get categoryDirPath(): string {
    return this._categoryDirPath;
  }

  set categoryDirPath(val: string) {
    if (val) {
      val = val.replace(new RegExp("\\\\", "g"), '/');
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
    this._currentPath = val;
    if (!val) {
      this.displayPath = val;
      return;
    }

    const pathContents = this.currentPath.split('/');

    // TODO Just TAKE LAST OF CATEGORY PATH AND ALL THE NEW ONES
    const categoryPath = this.categoryDirPath.split('/');
    let dispPath = categoryPath[categoryPath.length - 1];
    if (pathContents.length === categoryPath.length) {
      this.displayPath = `${dispPath} / `;
      return;
    }

    for (let i = categoryPath.length; i<pathContents.length; ++i) {
      dispPath += `${pathContents[i]} / `;
    }

    this.displayPath = dispPath;
  }

  private _currentPath: string;

  public displayPath: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

}
