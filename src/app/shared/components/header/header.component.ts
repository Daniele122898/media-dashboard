import { Component, OnInit } from '@angular/core';
import {faTimes, faMinus} from '@fortawesome/free-solid-svg-icons';
import {faSquare} from '@fortawesome/free-regular-svg-icons';
import {ElectronService} from "../../../core/services";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public faTimes = faTimes;
  public faMinus = faMinus;
  public faSquare = faSquare;

  constructor(
    private electronService: ElectronService,
  ) { }

  ngOnInit(): void {
  }

  public minimizeWindow(): void {
    this.electronService.window.minimize();
  }

  public fullScreenWindow(): void {
    if (this.electronService.window.isMaximized()) {
      this.electronService.window.unmaximize();
    } else {
      this.electronService.window.maximize();
    }
  }

  public closeWindow(): void {
    this.electronService.window.close();
  }
}
