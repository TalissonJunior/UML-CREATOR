import { Link } from './link';

export class FakeLink {
  from: number;
  to: number;
  selectedNode: any;
  selectedLink: any;
  mousedownNode: any;
  mouseupNode: any;
  dragLine: any;

  constructor(fakeLink?: FakeLink) {
    if (fakeLink) {
      this.from = fakeLink.from;
      this.to = fakeLink.to;
      this.selectedNode = fakeLink.selectedNode;
      this.selectedLink = fakeLink.selectedLink;
      this.mousedownNode = fakeLink.mousedownNode;
      this.dragLine = fakeLink.dragLine;
    }
  }

  toLink(): Link {
    return new Link({
      source: this.from,
      target: this.to
    });
  }
}
