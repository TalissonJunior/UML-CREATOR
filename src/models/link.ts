export class Link {
  source: number;
  target: number;

  constructor(link?: Link) {
    if (link) {
      this.source = link.source;
      this.target = link.target;
    }
  }
}
