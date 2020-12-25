import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from 'video.js';

interface extendedOptions extends VideoJsPlayerOptions {
  userActions: {
    doubleClick: ((dbclick: any) => {}) | boolean,
    hotkeys: ((e: any) => {}) | boolean | object
  }
}

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

  @ViewChild('target', {static: true}) target: ElementRef;
  @Input() options: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean,
    controls: boolean,
    sources: {
      src: string,
      type: string,
    }[],
  };
  player: videojs.Player;

  constructor() {
  }

  ngOnInit() {
    // instantiate Video.js
    this.player = videojs(
      this.target.nativeElement,
      <extendedOptions>{
        ...this.options,
        playbackRates: [0.5, 0.75, 1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2],
        userActions: {
          doubleClick: true,
          hotkeys: function(event) {
            const p: VideoJsPlayer = this;
            // Arrow left
            if (event.which === 37) {
              const curr = p.currentTime();
              p.currentTime(Math.max(0, curr - 5));
            }

            // Arrow right
            if (event.which === 39) {
              const curr = p.currentTime();
              const vidLength = p.duration();
              p.currentTime(Math.min(vidLength, curr + 5));
            }

            // spacebar
            if (event.which === 32) {
              if (p.paused()) {
                p.play();
              } else {
                p.pause();
              }
            }
          }
        }
      },
      () => {
        console.log('onPlayerReady', this);
      }
    );
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }

}
