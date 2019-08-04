import { UMLCreator } from './uml-creator';
import { createDefault } from '../mocks/default';
import { UML } from '../models/uml';
import { Link } from '../models/link';
import { FakeLink } from '../models/fake-link';
import { ContextMenu } from './context-menu';
import { JsonUMLCreator } from '../models/jsonUMLCreator';
import { Utils } from './utils';

declare const d3;

class App {
  containeRef;
  svgContainer;
  workspaceElement: HTMLElement;
  umlMenuItemElement: HTMLElement;
  nodes: Array<UMLCreator>;
  links: Array<Link>;
  private nodesData: Array<UML>;
  private currentLink: FakeLink;

  constructor(containerReference?: string) {
    this.nodesData = new Array<UML>();
    this.nodes = new Array<UMLCreator>();
    this.links = new Array<Link>();
    this.currentLink = new FakeLink();

    this.init(containerReference);

    this.svgContainer = this.create();
    this.addLinksConfiguation();
  }

  public fromJson(json: JsonUMLCreator): void {
    if (!json.data) {
      throw 'Json must have a data property, ex. data: { nodes:[], links: [] }';
    } else if (!Utils.isArray(json.data.nodes)) {
      throw "Json property 'data.nodes' must be of type array, ex. data: { nodes:[], links: [] }";
    } else if (json.data.links && !Utils.isArray(json.data.links)) {
      throw "Json property 'data.links' must be of type array, ex. data: { nodes:[], links: [] }";
    }

    if (json.data.links && json.data.links.length > 0) {
      this.links = json.data.links;
    }

    if (json.data.nodes && json.data.nodes.length > 0) {
      json.data.nodes.forEach(umlNode => {
        this.addNewUMLNode(umlNode);
      });
    }

    this.restartLinks();
  }

  public toJson(): JsonUMLCreator {
    if (!this.links && !this.nodes) {
      return new JsonUMLCreator();
    } else if (!this.nodes && this.links) {
      return new JsonUMLCreator([], this.links);
    }

    const nodes = this.nodes.map(node => {
      return node.formatPropertiesAndMethods(node.uml);
    });

    return new JsonUMLCreator(nodes, this.links);
  }

  private init(containerReference?: string): void {
    this.containeRef = containerReference ? containerReference : 'body';

    // add workspace area
    d3.select(this.containeRef)
      .append('xhtml:div')
      .attrs({
        id: 'uml_diagram_workspace',
        class: 'uml-diagram-creator'
      });

    // add menu list
    d3.select(this.containeRef)
      .append('xhtml:ul')
      .attr('class', 'uml-menu')
      .append('li')
      .append('span')
      .attrs({
        id: 'uml_menu_item',
        draggable: 'true',
        class: 'uml-class-icon'
      });

    this.workspaceElement = document.getElementById('uml_diagram_workspace');

    // Menu drag listeners
    this.workspaceElement.addEventListener('dragover', function(
      event: DragEvent
    ) {
      event.preventDefault();
    });
    this.workspaceElement.addEventListener('drop', (event: DragEvent) => {
      let lastId =
        this.nodesData.length > 0
          ? this.nodesData[this.nodesData.length - 1].key
          : 0;
      lastId++;

      const newUML = createDefault(lastId, { x: event.x, y: event.y });

      this.addNewUMLNode(newUML);
    });
  }

  private addLinksConfiguation(): void {
    const svg = this.svgContainer;
    const selftContext = this;

    // Define Arrow marker to use when drawing links
    svg
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

    // line displayed when dragging new nodes
    this.currentLink.dragLine = svg
      .append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    // place where links element will be
    this.svgContainer.append('svg:g').attr('key', 'links');

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!selftContext.currentLink.mousedownNode) return;

      // update drag line
      selftContext.currentLink.dragLine.attr(
        'd',
        `M${selftContext.currentLink.mousedownNode.x},${selftContext.currentLink.mousedownNode.y}L${e.clientX},${e.clientY}`
      );
    });

    window.addEventListener('mouseup', () => {
      if (selftContext.currentLink.mousedownNode) {
        // hide drag line
        selftContext.currentLink.dragLine
          .classed('hidden', true)
          .style('marker-end', '');

        selftContext.resetCurrentLink();
      }
    });
  }

  private resetCurrentLink(): void {
    // Reset current link
    this.currentLink.mousedownNode = null;
    this.currentLink.mouseupNode = null;
  }

  private create(): any {
    const container = d3
      .select('#uml_diagram_workspace')
      .append('svg')
      .attrs({
        width: window.innerWidth,
        height: window.innerHeight
      })
      // Add zoom
      /*.call(
        d3.zoom().on('zoom', () => {
          const canZoom = d3.select('body').attr('canZoom');

          // Close context menu if it is open
          new ContextMenu('close');

          if (canZoom != 'false' || canZoom == 'true') {
            container.attr('transform', d3.event.transform);
          }
        })
      )*/
      .append('g');

    // Update workspace width and height on window resize
    window.addEventListener('resize', () => {
      d3.select(container.node().parentNode).attrs({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    return container;
  }

  private addNewUMLNode(newUML: UML): void {
    const activeColor = '#FF9800';
    const inactiveColor = '#a3a3a3';

    this.nodesData.push(newUML);

    const umlCreator = new UMLCreator(newUML, this.svgContainer);
    this.nodes.push(umlCreator);

    // Add link arrows
    umlCreator.instance
      .on('click', () => {
        if (umlCreator.getBorderColor() == activeColor) {
          this.removeLinkArrows(umlCreator);
          umlCreator.changeBorderColor(umlCreator.defaultBorderColor);
          umlCreator.enableDrag();
        } else {
          umlCreator.changeBorderColor(activeColor);
          this.addLinkArrows(umlCreator, inactiveColor, '#000000');
          umlCreator.disableDrag();
        }
      })
      .on('mouseover', () => {
        if (
          !this.currentLink.mousedownNode ||
          umlCreator.instance === this.currentLink.mousedownNode
        )
          return;
        // Active color
        umlCreator.changeBorderColor(activeColor);
      })
      .on('mouseout', () => {
        if (
          !this.currentLink.mousedownNode ||
          umlCreator.instance === this.currentLink.mousedownNode
        )
          return;

        // Reset color
        umlCreator.changeBorderColor(umlCreator.defaultBorderColor);
      })
      .on('mouseup', () => {
        if (!this.currentLink.mousedownNode) return;

        // needed by FF
        this.currentLink.dragLine
          .classed('hidden', true)
          .style('marker-end', '');

        // check for drag-to-self
        if (umlCreator.instance === this.currentLink.mousedownNode) {
          this.resetCurrentLink();
          this.nodes.forEach(node => {
            node.enableDrag();
          });
          return;
        }

        // Reset effect
        umlCreator.changeBorderColor(umlCreator.defaultBorderColor);

        this.currentLink.to = umlCreator.uml.key;
        const newLink = this.currentLink.toLink();

        const foundLink = this.links.find(
          link => link.source == newLink.source && link.target == newLink.target
        );

        if (!foundLink) {
          this.links.push(newLink);
        }

        this.resetCurrentLink();
        this.restartLinks();
        this.nodes.forEach(node => {
          node.enableDrag();
        });
      });
  }

  private addLinkArrows(
    umlCreator: UMLCreator,
    inactiveColor: string,
    activeColor: string
  ) {
    const arrows = ['top', 'right', 'bottom', 'left'];

    arrows.forEach(arrow => {
      let x, y, x1, y1, x2, y2;

      if (arrow == 'top') {
        x = 0;
        y = +30;
        x1 = umlCreator.width / 2;
        y1 = -10;
        x2 = umlCreator.width / 2;
        y2 = -30;
      } else if (arrow == 'right') {
        x = -30;
        y = 0;
        x1 = umlCreator.width + 10;
        y1 = umlCreator.height / 2;
        x2 = umlCreator.width + 30;
        y2 = umlCreator.height / 2;
      } else if (arrow == 'bottom') {
        x = 0;
        y = -30;
        x1 = umlCreator.width / 2;
        y1 = umlCreator.height + 10;
        x2 = umlCreator.width / 2;
        y2 = umlCreator.height + 30;
      } else {
        x = +30;
        y = 0;
        x1 = -10;
        y1 = umlCreator.height / 2;
        x2 = -30;
        y2 = umlCreator.height / 2;
      }

      // Arrow
      const arrowSymbol = umlCreator.instance
        .append('svg:defs')
        .attr('key', 'triangle-right')
        .append('svg:marker')
        .attr('id', `${umlCreator.uml.key}triangle-${arrow}`)
        .attr('refX', 3)
        .attr('refY', 3)
        .attr('markerWidth', 30)
        .attr('markerHeight', 30)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 6 3 0 6 1.5 3')
        .style('cursor', 'pointer')
        .style('transition', 'fill 0.2s ease-in-out')
        .style('fill', inactiveColor);

      // Arrow rect
      const arrowRect = umlCreator.instance
        .append('line')
        .attr('group', umlCreator.uml.key + '_arrow')
        .attr('key', `arrow-${arrow}`)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('marker-end', `url(#${umlCreator.uml.key}triangle-${arrow})`)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('transition', 'stroke 0.2s ease-in-out')
        .style('stroke', inactiveColor);

      arrowRect
        .on('mouseover', function() {
          arrowSymbol.style('fill', activeColor);
          arrowRect.style('stroke', activeColor);
        })
        .on('mouseout', function() {
          arrowSymbol.style('fill', inactiveColor);
          arrowRect.style('stroke', inactiveColor);
        })
        .on('mousedown', () => {
          umlCreator.disableDrag();
          this.removeLinkArrows(umlCreator);
          umlCreator.changeBorderColor(umlCreator.defaultBorderColor);

          // select node
          this.currentLink.from = umlCreator.uml.key;
          this.currentLink.mousedownNode = umlCreator.instance;
          this.currentLink.selectedNode =
            this.currentLink.mousedownNode === this.currentLink.selectedNode
              ? null
              : this.currentLink.mousedownNode;
          this.currentLink.selectedLink = null;

          this.currentLink.mousedownNode.x = d3.event.x + x;
          this.currentLink.mousedownNode.y = d3.event.y + y;
          // reposition drag line
          this.currentLink.dragLine
            .style('marker-end', 'url(#arrow)')
            .classed('hidden', false)
            .attr(
              'd',
              `M${this.currentLink.mousedownNode.x},${this.currentLink.mousedownNode.y}L${this.currentLink.mousedownNode.x},${this.currentLink.mousedownNode.y}`
            );
        });
    });
  }

  private removeLinkArrows(umlCreator: UMLCreator): void {
    const arrows = ['top', 'right', 'bottom', 'left'];

    arrows.forEach(arrow => {
      umlCreator.instance.select(`[key="arrow-${arrow}"]`).remove();
      umlCreator.instance.select(`[key="triangle-${arrow}"]`).remove();
    });
  }

  private restartLinks(): void {
    let path = this.svgContainer.select('[key="links"]').selectAll('path');

    path = path.data(this.links);

    // update existing links
    path.style('marker-end', 'url(#arrow)');

    // remove old links
    path.exit().remove();

    // add new links
    path = path
      .enter()
      .append('svg:path')
      .attr('class', 'link')
      .attr('source', d => d.source)
      .attr('target', d => d.target);
    path
      .style('marker-end', 'url(#arrow)')
      .on('mousedown', d => {
        if (d3.event.ctrlKey) return;
      })
      .on('contextmenu', d => {
        new ContextMenu([
          {
            title: 'Remove',
            action: () => {
              this.links.splice(d.index, 1);
              this.restartLinks();
            }
          }
        ]);
      })
      .merge(path);

    // init D3 force layout
    const simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink()
          .id((d: UMLCreator) => d.uml.key)
          .links(this.links)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .on('tick', function() {
        path.attr('d', d => {
          const centerSourceX = d.source.uml.position.x + d.source.width / 2;
          const centerSourceY = d.source.uml.position.y + d.source.height / 2;
          const centerTargetX = d.target.uml.position.x + d.target.width / 2;
          const centerTargetY = d.target.uml.position.y + d.target.height / 2;

          const deltaX = centerTargetX - centerSourceX;
          const deltaY = centerTargetY - centerSourceY;
          const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const normX = deltaX / dist;
          const normY = deltaY / dist;
          const sourcePadding = 30;
          const targetPadding = 30;
          const sourceX = centerSourceX + sourcePadding * normX;
          const sourceY = centerSourceY + sourcePadding * normY;
          const targetX = centerTargetX - targetPadding * normX;
          const targetY = centerTargetY - targetPadding * normY;

          return `M${sourceX},${sourceY}L${targetX},${targetY}`;
        });
      });

    simulation.alphaTarget(0.2).restart();
  }
}

export const init = (containerReference?: string) =>
  new App(containerReference);
