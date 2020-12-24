import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';

import { VideoComponent } from './video.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [VideoComponent],
  imports: [CommonModule, SharedModule, VideoRoutingModule]
})
export class VideoModule {}
