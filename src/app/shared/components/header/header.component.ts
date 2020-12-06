import {Component, OnInit} from '@angular/core';
import {faTimes, faMinus} from '@fortawesome/free-solid-svg-icons';
import {faSquare} from '@fortawesome/free-regular-svg-icons';
import {ElectronService} from "../../../core/services";
import {WindowEvents} from "../../../../../shared/models/windowEvents";

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
  ) {
  }

  ngOnInit(): void {
  }

  public minimizeWindow(): void {
    this.electronService.invokeHandler('window-events', WindowEvents.minimize);
  }

  public fullScreenWindow(): void {
    this.electronService.invokeHandler('window-events', WindowEvents.isMaximized)
      .subscribe(
        (isMaximized) => {
          if (isMaximized) {
            this.electronService.invokeHandler('window-events', WindowEvents.unmaximize);
          } else {
            this.electronService.invokeHandler('window-events', WindowEvents.maximize);
          }
        }, err => {
          console.error(err);
        });

  }

  public closeWindow(): void {
    this.electronService.invokeHandler('window-events', WindowEvents.close);
  }
}
