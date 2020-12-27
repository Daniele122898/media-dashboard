import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';

import { VideoComponent } from './video.component';
import { SharedModule } from '../shared/shared.module';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [VideoComponent, VideoPlayerComponent],
  imports: [CommonModule, SharedModule, VideoRoutingModule, FontAwesomeModule]
})
export class VideoModule {}
