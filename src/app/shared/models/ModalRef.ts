import { Subject } from 'rxjs';

export class ModalRef {
  private readonly valueSubj = new Subject<any>();
  public Value$ = this.valueSubj.asObservable();

  constructor() { }

  submit(data: any) {
    this.valueSubj.next(data);
  }
}
