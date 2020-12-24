import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detail',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  public filePath: string;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const path = this.route.snapshot.queryParams.filePath;
    if (path) {
      this.filePath = atob(path);
    }
  }

  public onBack(): void {
    this.location.back();
  }
}
