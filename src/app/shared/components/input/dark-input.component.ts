import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './dark-input.component.html',
  styleUrls: ['./dark-input.component.scss']
})
export class DarkInputComponent implements OnInit {
  searchString: string = "";
  @Output() searchChangedEvent: EventEmitter<string> = new EventEmitter<string>();
  @Input() enableSmall = false;
  @Input() customPlaceholder = "";
  @Input() showSearchIcon = true;

  constructor() { }

  ngOnInit(): void {
  }

  searchChanged(e: string) {
    this.searchChangedEvent.emit(e);
  }
}
