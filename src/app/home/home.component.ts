import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ElectronService} from "../core/services";
import {faFolder, faFolderOpen, faArrowUp} from '@fortawesome/free-solid-svg-icons';


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

  public testArray = []

  constructor(
    private router: Router,
    private electronService: ElectronService,
  ) { }

  ngOnInit(): void {
    this.testArray.length = 15;
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
