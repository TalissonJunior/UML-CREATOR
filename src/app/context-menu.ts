import { ContextMenuItem } from '../models/context-menu-item';
import { ContextMenuConfig } from '../models/context-menu-config';

declare const d3;

export class ContextMenu {
  menuItems: Array<ContextMenuItem>;
  config: ContextMenuConfig;
  self;

  constructor(
    menuItems: Array<ContextMenuItem> | string,
    config?: ContextMenuConfig
  ) {
    // allow for `new ContextMenu('close');` calls
    // to programatically close the menu
    if (menuItems === 'close') {
      this.closeMenu();
    } else {
      this.menuItems = menuItems as Array<ContextMenuItem>;
      this.config = config;
      this.init();
    }
  }

  init(): void {
    // close any menu that's already opened
    this.closeMenu();

    // create the div element that will hold the context menu
    d3.selectAll('.d3-context-menu')
      .data([1])
      .enter()
      .append('div')
      .attr('class', 'd3-context-menu ');

    // close menu on mousedown outside
    d3.select('body').on('mousedown.d3-context-menu', this.closeMenu);
    d3.select('body').on('click.d3-context-menu', this.closeMenu);

    const parent = d3.selectAll('.d3-context-menu').append('ul');

    parent.call(this.createNestedMenu.bind(this));

    // display context menu
    d3.select('.d3-context-menu')
      .style('left', d3.event ? d3.event.pageX - 2 + 'px' : 0 + 'px')
      .style('top', d3.event ? d3.event.pageY - 2 + 'px' : 0 + 'px')
      .style('display', 'block');

    const scale = d3.select('body').attr('zoom');

    if (scale) {
      d3.select('.d3-context-menu').style('transform', `scale(${scale})`);
    }

    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }

  closeMenu(): void {
    d3.select('.d3-context-menu').remove();
    d3.select('body').on('mousedown.d3-context-menu', null);
  }

  createNestedMenu(parent) {
    const selfContext = this;

    parent
      .selectAll('li')
      .data(this.menuItems)
      .enter()
      .append('li')
      .each(function(menuItem: ContextMenuItem, index: number) {
        d3.select(this)
          .html(menuItem.title)
          .on('click', () => {
            if (menuItem.action) {
              menuItem.action(index);
            }

            selfContext.closeMenu();
          });
      });
  }
}
