import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;

  constructor() {
    this.db = (<any>window).openDatabase('mediaDb', '1.0', 'Media Dashboard DB', 2 * 1024 * 1024);
    this.checkIfTablesExist();
  }

  private checkIfTablesExist(): void {
    this.db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS Categories (' +
        'Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'Name VARCHAR(255) NOT NULL,' +
        'DirPath nvarchar(260) NOT NULL,' +
        'ParentId int DEFAULT NULL,' +
        'FOREIGN KEY (ParentId) REFERENCES Categories(ID)' +
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
