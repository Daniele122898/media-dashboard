import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './dark-input.component.html',
  styleUrls: ['./dark-input.component.scss']
})
export class DarkInputComponent implements OnInit {
  @Input() enableSmall = false;
  @Input() autoFocus = false;
  @Input() customPlaceholder = "";
  @Input() showPlaceholder = true;
  @Input() showSearchIcon = false;

  @Input() input: string;
  @Output() inputChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  searchChanged(e: string) {
    this.inputChange.emit(e);
  }
}
