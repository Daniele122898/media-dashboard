import {Component, OnInit} from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import {ModalService} from "./shared/services/modal.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  public showModal = false;


  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private modalService: ModalService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
      // new Notification('Media Dashboard', {
      //   body: 'Dashboard has started'
      // });
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit(): void {
    this.modalService.ShowModal$
      .subscribe(
        (show) => {
          this.showModal = show;
        }, err => {
          console.error(err);
        }
      )
  }
}
