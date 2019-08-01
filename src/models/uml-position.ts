export class UMLPosition {
  x: number;
  y: number;

  constructor(position?: UMLPosition) {
    if (position) {
      this.x = position.x;
      this.y = position.y;
    }
  }
}
