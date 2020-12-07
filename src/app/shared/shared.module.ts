import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PageNotFoundComponent} from './components/';
import {WebviewDirective} from './directives/';
import {FormsModule} from '@angular/forms';
import {HeaderComponent} from './components/header/header.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { SearchBarComponent } from './components/search-bar/search-bar.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, HeaderComponent, SearchBarComponent],
  imports: [CommonModule, TranslateModule, FormsModule, FontAwesomeModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, HeaderComponent, SearchBarComponent]
})
export class SharedModule {
}
