import {Bookmark} from "./Bookmark";
import {FileDbo} from "./FileDbo";

export interface BookmarkModalData {
  isFile: boolean;
  fileData?: BookmarkModalFileData;
  categoryData?: BookmarkModalCategoryData;
}

export interface BookmarkModalFileData {
  fileId: number;
  currentTimestamp: number;
}

export interface BookmarkModalCategoryData {
  categoryId: number;
  dirPath: string;
}

export interface BookmarkModalResponse {
  selectedBookmark: ExtendedBookmark;
}

export interface ExtendedBookmark extends Bookmark {
  FileDbo?: FileDbo;
}
