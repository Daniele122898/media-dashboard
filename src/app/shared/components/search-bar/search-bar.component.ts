import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  searchString: string = "";
  @Output() searchChangedEvent: EventEmitter<string> = new EventEmitter<string>();
  @Input() enableSmall = false;

  constructor() { }

  ngOnInit(): void {
  }

  searchChanged(e: string) {
    this.searchChangedEvent.emit(e);
  }
}
