import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {first, map} from "rxjs/operators";
import {SqlResultSet} from "../models/SqlTypes";
import {Category} from "../models/Category";

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
    return this.executeTransaction(`DELETE FROM Categories WHERE Id = ${id.toString()}`)
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
        'FOREIGN KEY (ParentId) REFERENCES Categories(Id)' +
        ')');

      tx.executeSql('CREATE TABLE IF NOT EXISTS Files(' +
        '        Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        '        Md5Hash BLOB NOT NULL,' +
        '        LKPath nvarchar(260) NOT NULL,' +
        '        Finished boolean DEFAULT 0, ' +
        '        LastTimestamp int' +
        ')');
    });
  }
}
