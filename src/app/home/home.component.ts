import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {ElectronService} from "../core/services";
import {faFolder, faFolderOpen, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import {DatabaseService} from "../shared/services/database.service";
import {Category} from "../shared/models/Category";
import {first} from "rxjs/operators";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public sidebarSearchString: string;
  private contentSearchString: string;

  public faFolder = faFolder;
  public faFolderOpen = faFolderOpen;
  public faArrowUp = faArrowUp;

  public categories: Category[] = [];

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private changeDetection: ChangeDetectorRef,
    private db: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.db.getAllCategories()
      .pipe(first())
      .subscribe((res) => {
        this.categories = res;
        this.changeDetection.detectChanges();
        console.log(this.categories);
      }, err => {
        console.error(err);
      });
  }

  public sendExampleIpc(): void {
    this.electronService.sendIpcMessage('channel1', {message: 'hello'});
  }

  public openFileLocation(): void {
    this.electronService.openFileLocation('F:\\Coding\\media-dashboard\\_config.yml');
  }

  public sidebarSearchChanged(e: string): void {
    this.sidebarSearchString = e;
  }

  public contentSearchChanged(e: string): void {
    this.contentSearchString = e;
  }
}
