import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ElectronService} from "../core/services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private electronService: ElectronService,
  ) { }

  ngOnInit(): void { }

  sendExampleIpc() {
    this.electronService.sendIpcMessage('channel1', {message: 'hello'});
  }
}
