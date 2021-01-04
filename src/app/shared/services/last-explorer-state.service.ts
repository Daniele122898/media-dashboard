import { Injectable } from '@angular/core';
import {Category} from "../models/Category";

@Injectable({
  providedIn: 'root'
})
export class LastExplorerStateService {

  public lastSelectedCategory: Category;
  public lastCurrentPath: string;

  constructor() { }
}
