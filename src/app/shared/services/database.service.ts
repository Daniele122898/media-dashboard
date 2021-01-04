import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {SqlResultSet} from "../models/SqlTypes";
import {Category} from "../models/Category";
import {FileDbo} from "../models/FileDbo";
import {Bookmark} from "../models/Bookmark";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;

  constructor() {
    this.db = (<any>window).openDatabase('mediaDb', '1.0', 'Media Dashboard DB', 2 * 1024 * 1024);
    this.checkIfTablesExist();
  }
  public insertNewCategory(name: string, dirPath: string, parentId?: number): Observable<SqlResultSet> {
    return this.executeTransaction(`INSERT INTO Categories (Name, DirPath, ParentId) VALUES ('${name}', '${dirPath}', ${(!!parentId ? parentId.toString(): 'NULL')})`);
  }

  public getAllCategories(): Observable<Category[]> {
    return this.executeTransaction(`SELECT * FROM Categories`)
      .pipe(
        map(values => DatabaseService.mapRowsToArray<Category>(values.rows))
      );
  }

  // TODO Add: If we remove a category we should also remove the bookmarks associated with it :)
  public removeCategory(id: number): Observable<SqlResultSet> {
    return this.executeTransaction(`DELETE FROM Categories WHERE Id = ${id.toString()} OR ParentId = ${id.toString()}`)
  }

  public getBookmarksWithFileId(id: number): Observable<Bookmark[]> {
    return this.executeTransaction(`SELECT * FROM Bookmarks WHERE FileId = ${id.toString()}`)
      .pipe(
        map(values => DatabaseService.mapRowsToArray<Bookmark>(values.rows))
      )
  }

  public getBookmarksWithCategoryId(id: number): Observable<Bookmark[]> {
    return this.executeTransaction(`SELECT * FROM Bookmarks WHERE CategoryId = ${id.toString()}`)
      .pipe(
        map(values => DatabaseService.mapRowsToArray<Bookmark>(values.rows))
      )
  }

  public createBookmark(fileId: number, categoryId: number, dirPath: string, timestamp: number, desc: string): Observable<SqlResultSet> {
    return this.executeTransaction(
      `INSERT INTO Bookmarks (FileId, CategoryId, DirPath, Timestamp, Description)
      VALUES (${fileId.toString()}, ${categoryId.toString()}, '${dirPath}', ${timestamp.toString()}, '${desc}')`
    );
  }

  public removeBookmark(id: number): Observable<SqlResultSet> {
    return this.executeTransaction(`DELETE FROM Bookmarks WHERE Id = ${id.toString()}`)
  }

  public insertNewFile(file: FileDbo): Observable<SqlResultSet> {
    return this.executeTransaction(
      `INSERT INTO Files (FileId, LKPath, Finished, LastTimestamp, Duration)
      VALUES ('${file.FileId}', '${file.LKPath}', ${file.Finished}, ${file.LastTimestamp}, ${file.Duration})`
    );
  }

  public updateFile(file: FileDbo): Observable<SqlResultSet> {
    return this.executeTransaction(
      `UPDATE Files SET LKPath = '${file.LKPath}', Finished = ${file.Finished}, LastTimestamp = ${file.LastTimestamp} WHERE Id = ${file.Id}`
    );
  }

  public tryGetFileWithFileId(fileId: string): Observable<FileDbo> {
    return this.executeTransaction(
      `SELECT * FROM Files WHERE FileId = '${fileId}'`
    ).pipe(
      map(values => {
        return DatabaseService.getSingularValue(values);
      })
    );
  }

  // Row is not actually an array but an object that fakes being an array. It has objects 0,1,2... and the last member is
  // length. This method makes it a proper array so we can use all our methods like .map and co on it
  private static mapRowsToArray<T>(rows: any): T[] {
    const n = rows.length;
    const array: T[] = [];
    for (let i = 0; i<n; ++i) {
      array.push({
        ...rows[i]
      })
    }
    return array;
  }

  private static getSingularValue<T>(result: SqlResultSet): T {
    const arr = DatabaseService.mapRowsToArray<T>(result.rows);
    if (arr.length === 0)
      return null;

    return arr[0];
  }

  private executeTransaction(query: string): Observable<SqlResultSet> {
    return new Observable(sub => {
      this.db.transaction((tx) => {
        tx.executeSql(query, [],
          (transaction, result) => {
            sub.next(result);
            sub.complete();
          }, (transaction, error) => {
            sub.error(error);
          });
      });
    });
  }

  private checkIfTablesExist(): void {
    this.db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS Categories (' +
        'Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'Name VARCHAR(255) NOT NULL,' +
        'DirPath nvarchar(260) NOT NULL,' +
        'ParentId int DEFAULT NULL,' +
        'FOREIGN KEY (ParentId) REFERENCES Categories (Id) ON UPDATE CASCADE ON DELETE CASCADE' +
        ')');

      tx.executeSql('CREATE TABLE IF NOT EXISTS Files(' +
        '        Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        '        FileId varchar(50) NOT NULL,' +
        '        LKPath nvarchar(260) NOT NULL,' +
        '        Finished boolean DEFAULT 0, ' +
        '        LastTimestamp int,' +
        '        Duration int' +
        ')');

      tx.executeSql('CREATE TABLE IF NOT EXISTS Bookmarks(' +
        '        Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        '        FileId int NOT NULL,' +
        '        CategoryId int NOT NULL,' +
        '        DirPath nvarchar(260) NOT NULL,' +
        '        LastTimestamp int,' +
        '        Description varchar(255)' +
        ')');
    });
  }
}
