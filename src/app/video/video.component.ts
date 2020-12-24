import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  constructor(
    private location: Location,
  ) { }

  ngOnInit(): void { }

  public onBack(): void {
    this.location.back();
  }
}
