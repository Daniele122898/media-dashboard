import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { ExplorerComponent } from './components/explorer/explorer.component';

@NgModule({
  declarations: [HomeComponent, ExplorerComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, FontAwesomeModule]
})
export class HomeModule {}
