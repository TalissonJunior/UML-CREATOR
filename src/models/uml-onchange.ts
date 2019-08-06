import { UMLOnChangeType } from '../enums/uml-onchange-type';
import { UML } from './uml';

export class UMLOnChange {
  type: UMLOnChangeType | Array<UMLOnChangeType>;
  callback: (...uml: UML[]) => void;

  constructor(umlOnChange: UMLOnChange) {
    if (umlOnChange) {
      this.type = umlOnChange.type;
      this.callback = umlOnChange.callback;
    }
  }
}
