import { UMLCreator } from './uml-creator';
import { createDefault } from '../mocks/default';
import { UML } from '../models/uml';
import { ContextMenu } from './context-menu';

declare const d3;

class App {
	svgContainer;
	workspaceElement: HTMLElement;
	umlMenuItemElement: HTMLElement;
	lastId: number;
	data: Array<UML>;

	constructor() {
		this.svgContainer = this.create();
		this.data = new Array<UML>();
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
					// Close context menu if it is open
					new ContextMenu('close');

					d3.select('body').attr('zoom', d3.event.transform.k);
					container.attr('transform', d3.event.transform);
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

		return container;
	}

	private onMenuUMLDragOverWorkspace(event: DragEvent): void {
		event.preventDefault();
	}

	private onMenuUMLDropOnWorkspace(event: DragEvent): void {
		this.lastId++;

		const newUML = createDefault(this.lastId, { x: event.x, y: event.y });

		this.data.push(newUML);

		new UMLCreator(newUML, this.svgContainer);
	}
}

window.onload = () => {
	const app = new App();
	app.init();
};
