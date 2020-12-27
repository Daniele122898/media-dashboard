import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {SqlResultSet} from "../models/SqlTypes";
import {Category} from "../models/Category";
import {FileDbo} from "../models/FileDbo";

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

  public removeCategory(id: number): Observable<SqlResultSet> {
    return this.executeTransaction(`DELETE FROM Categories WHERE Id = ${id.toString()} OR ParentId = ${id.toString()}`)
  }

  public insertNewFile(file: FileDbo): Observable<SqlResultSet> {
    return this.executeTransaction(
      `INSERT INTO Files (Md5Hash, LKPath, Finished, LastTimestamp, Duration)
      VALUES ('${file.Md5Hash}', '${file.LKPath}', ${file.Finished}, ${file.LastTimestamp}, ${file.Duration})`
    );
  }

  public updateFile(file: FileDbo): Observable<SqlResultSet> {
    return this.executeTransaction(
      `UPDATE Files SET LKPath = '${file.LKPath}', Finished = ${file.Finished}, LastTimestamp = ${file.LastTimestamp} WHERE Id = ${file.Id}`
    );
  }

  public tryGetFileWithHash(hash: string): Observable<FileDbo> {
    return this.executeTransaction(
      `SELECT * FROM Files WHERE Md5Hash = '${hash}'`
    ).pipe(
      map(values => {
        const arr = DatabaseService.mapRowsToArray<FileDbo>(values.rows);
        if (arr.length === 0) {
          return null;
        }
        return arr[0];
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
        '        Md5Hash BLOB NOT NULL,' +
        '        LKPath nvarchar(260) NOT NULL,' +
        '        Finished boolean DEFAULT 0, ' +
        '        LastTimestamp int,' +
        '        Duration int' +
        ')');
    });
  }
}
