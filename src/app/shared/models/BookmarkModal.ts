import {Bookmark} from "./Bookmark";

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
  selectedBookmark: Bookmark;
}
