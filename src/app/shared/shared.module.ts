import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PageNotFoundComponent} from './components/';
import {WebviewDirective} from './directives/';
import {FormsModule} from '@angular/forms';
import {HeaderComponent} from './components/header/header.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { DarkInputComponent } from './components/input/dark-input.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModalInjectorDirective } from './directives/modal-injector.directive';
import { CreateCategoryModalComponent } from './components/modal/modals/create-category-modal/create-category-modal.component';
import { CreateBookmarkModalComponent } from './components/modal/modals/create-bookmark-modal/create-bookmark-modal.component';
import { ViewBookmarksModalComponent } from './components/modal/modals/view-bookmarks-modal/view-bookmarks-modal.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, HeaderComponent, DarkInputComponent, ModalComponent, ModalInjectorDirective, CreateCategoryModalComponent, CreateBookmarkModalComponent, ViewBookmarksModalComponent],
  imports: [CommonModule, TranslateModule, FormsModule, FontAwesomeModule],
    exports: [TranslateModule, WebviewDirective, FormsModule, HeaderComponent, DarkInputComponent, ModalComponent]
})
export class SharedModule {
}
