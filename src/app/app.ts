import { UMLCreator } from './uml-creator';
import { createDefault } from '../mocks/default';
import { UML } from '../models/uml';
import { ContextMenu } from './context-menu';

declare const d3;

class App {
  svgContainer;
  workspaceElement: HTMLElement;
  umlMenuItemElement: HTMLElement;
  activeColor = '#FF9800';
  lastId: number;
  nodes: Array<UML>;

  constructor() {
    this.svgContainer = this.create();
    this.nodes = new Array<UML>();
    this.lastId = 0;
  }

  init(): void {
    this.workspaceElement = document.getElementById('uml_diagram_workspace');

    // Menu drag listeners
    this.workspaceElement.addEventListener(
      'dragover',
      this.onMenuUMLDragOverWorkspace
    );
    this.workspaceElement.addEventListener(
      'drop',
      this.onMenuUMLDropOnWorkspace.bind(this)
    );
  }

  create(): any {
    const container = d3
      .select('#uml_diagram_workspace')
      .append('svg')
      .attrs({
        width: window.innerWidth,
        height: window.innerHeight
      })
      // Add zoom
      .call(
        d3.zoom().on('zoom', () => {
          const canZoom = d3.select('body').attr('canZoom');

          // Close context menu if it is open
          new ContextMenu('close');

          if (canZoom != 'false' || canZoom == 'true') {
            container.attr('transform', d3.event.transform);
          }
        })
      )
      .append('g');

    // Update workspace width and height on window resize
    window.addEventListener('resize', () => {
      d3.select(container.node().parentNode).attrs({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    // Creates an arrow;
    d3.select('svg')
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'triangle')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .style('cursor', 'pointer')
      .style('fill', '#FF9800');

    return container;
  }

  private onMenuUMLDragOverWorkspace(event: DragEvent): void {
    event.preventDefault();
  }

  private onMenuUMLDropOnWorkspace(event: DragEvent): void {
    this.lastId++;

    const newUML = createDefault(this.lastId, { x: event.x, y: event.y });

    this.nodes.push(newUML);

    const umlCreator = new UMLCreator(newUML, this.svgContainer);

    umlCreator.instance.on('click', () => {
      const arrowInitialPos = 10;
      const arrowFinalPos = 30;

      // Resets to default
      if (umlCreator.getBorderColor() == this.activeColor) {
        umlCreator.instance.select('[key="arrow-top"]').remove();
        umlCreator.instance.select('[key="arrow-right"]').remove();
        umlCreator.instance.select('[key="arrow-left"]').remove();
        umlCreator.instance.select('[key="arrow-bottom"]').remove();
        umlCreator.changeBorderColor(umlCreator.defaultBorderColor);
      } else {
        umlCreator.changeBorderColor(this.activeColor);

        // Arrow top
        umlCreator.instance
          .append('line')
          .style('stroke', '#FF9800')
          .style('cursor', 'pointer')
          .attr('key', 'arrow-top')
          .attr('x1', umlCreator.width / 2)
          .attr('y1', -arrowInitialPos)
          .attr('x2', umlCreator.width / 2)
          .attr('y2', -arrowFinalPos)
          .attr('marker-end', 'url(#triangle)')
          .attr('stroke-width', 2);

        // Arrow right
        umlCreator.instance
          .append('line')
          .style('stroke', '#FF9800')
          .style('cursor', 'pointer')
          .attr('key', 'arrow-right')
          .attr('x1', umlCreator.width + arrowInitialPos)
          .attr('y1', umlCreator.height / 2)
          .attr('x2', umlCreator.width + arrowFinalPos)
          .attr('y2', umlCreator.height / 2)
          .attr('marker-end', 'url(#triangle)')
          .attr('stroke-width', 2);

        // Arrow bottom
        umlCreator.instance
          .append('line')
          .style('stroke', '#FF9800')
          .style('cursor', 'pointer')
          .attr('key', 'arrow-bottom')
          .attr('x1', umlCreator.width / 2)
          .attr('y1', umlCreator.height + arrowInitialPos)
          .attr('x2', umlCreator.width / 2)
          .attr('y2', umlCreator.height + arrowFinalPos)
          .attr('marker-end', 'url(#triangle)')
          .attr('stroke-width', 2);

        // Arrow left
        umlCreator.instance
          .append('line')
          .style('stroke', '#FF9800')
          .style('cursor', 'pointer')
          .attr('key', 'arrow-left')
          .attr('x1', -arrowInitialPos)
          .attr('y1', umlCreator.height / 2)
          .attr('x2', -arrowFinalPos)
          .attr('y2', umlCreator.height / 2)
          .attr('marker-end', 'url(#triangle)')
          .attr('stroke-width', 2);
      }
    });
  }
}

window.onload = () => {
  const app = new App();
  app.init();
};
