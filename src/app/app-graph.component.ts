import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';

export interface NetworkNode {
  id: string;
  label: string;
  type: 'client' | 'server' | 'database';
  sublabel?: string;
  description?: string;
  status?: string;
  hasWarning?: boolean;
  details?: { [key: string]: string };
  // For compound nodes (two elements)
  children?: NetworkNode[];
  parentId?: string; // for flattened children
}

export interface NetworkLink {
  source: string;
  target: string;
}

export interface NetworkConfig {
  nodeRadius?: number;
  linkDistance?: number;
  chargeStrength?: number;
  collisionRadius?: number;
  colors?: {
    client?: string;
    server?: string;
    database?: string;
    warning?: string;
  };
  icons?: {
    client?: string;
    server?: string;
    database?: string;
  };
}

@Component({
  selector: 'app-graph',
  template: `
    <div #container class="relative w-full rounded-xl p-6 " [class]="classes">
      <div class="relative border-gray-200 overflow-hidden" [class]="classes">
        <svg #networkSvg [attr.width]="width" [attr.height]="height" class="block"></svg>

        <div class="flex gap-2 mb-2">
          <span class="inline-flex items-center ">Lorem</span>
          <span class="inline-flex items-center">Lorem</span>
          <span class="inline-flex items-center">Lorem</span>
        </div>
        <!-- Hover Card -->
        <div
          *ngIf="hoveredNode"
          class="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-64 max-w-80 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          [style.left.px]="hoverPosition.x"
          [style.top.px]="hoverPosition.y - 10"
        >
          <!-- Card Arrow -->
          <div
            class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"
          ></div>

          <!-- Card Content -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-2xl">{{ getIcon(hoveredNode.type) }}</span>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ hoveredNode.label }}</h3>
                  <p *ngIf="hoveredNode.sublabel" class="text-sm text-gray-500">
                    {{ hoveredNode.sublabel }}
                  </p>
                </div>
              </div>
              <span
                class="px-2 py-1 text-xs rounded-full"
                [ngClass]="{
                  'bg-red-100 text-red-800': hoveredNode.hasWarning,
                  'bg-green-100 text-green-800': !hoveredNode.hasWarning
                }"
              >
                {{ hoveredNode.status || 'Active' }}
              </span>
            </div>

            <p *ngIf="hoveredNode.description" class="text-sm text-gray-700">
              {{ hoveredNode.description }}
            </p>

            <div *ngIf="hoveredNode.details" class="border-t border-gray-100 pt-3">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Details</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <ng-container *ngFor="let detail of getDetailsArray(hoveredNode.details)">
                  <div class="flex justify-between">
                    <span class="text-gray-500 capitalize"
                      >{{ detail.key.replace('_', ' ') }}:</span
                    >
                    <span class="text-gray-900 font-medium">{{ detail.value }}</span>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, FormsModule],
})
export class AppGraphComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('networkSvg', { static: true }) private svgElement!: ElementRef<SVGElement>;
  @ViewChild('container', { static: true }) private containerElement!: ElementRef<HTMLElement>;

  @Input() nodes: NetworkNode[] = [];
  @Input() links: NetworkLink[] = [];
  @Input() config: NetworkConfig = {};
  @Input() width: number = 500;
  @Input() height: number = 400;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() classes?: string;

  hoveredNode: NetworkNode | null = null;
  hoverPosition = { x: 0, y: 0 };

  private svg: any;
  private simulation: any;
  private defaultConfig: NetworkConfig = {
    nodeRadius: 35,
    linkDistance: 180,
    chargeStrength: -1000,
    collisionRadius: 60,
    colors: {
      client: '#8b5cf6',
      server: '#06b6d4',
      database: '#10b981',
      warning: '#ef4444',
    },
    icons: {
      client: '👤',
      server: '🗄️',
      database: '💾',
    },
  };

  ngOnInit() {
    this.initializeNetwork();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['nodes'] || changes['links'] || changes['config']) && this.svg) {
      this.initializeNetwork();
    }
  }

  ngOnDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  private get finalConfig(): NetworkConfig {
    return {
      ...this.defaultConfig,
      ...this.config,
      colors: { ...this.defaultConfig.colors, ...this.config.colors },
      icons: { ...this.defaultConfig.icons, ...this.config.icons },
    };
  }

  private flattenNodes(nodes: NetworkNode[]): NetworkNode[] {
    const flat: NetworkNode[] = [];
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          flat.push({ ...child, parentId: node.id });
        }
      } else {
        flat.push(node);
      }
    }
    return flat;
  }

  private initializeNetwork() {
    if (!this.nodes.length || !this.svgElement?.nativeElement) return;

    const flatNodes = this.flattenNodes(this.nodes);
    const element = this.svgElement.nativeElement;
    this.svg = d3.select(element);

    // Clear previous content
    this.svg.selectAll('*').remove();

    // Setup arrow markers
    const defs = this.svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', this.finalConfig.nodeRadius! + 5)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9ca3af');

    // Create gradients for nodes
    Object.entries(this.finalConfig.colors!).forEach(([type, color]) => {
      if (type === 'warning') return;

      const gradient = defs
        .append('radialGradient')
        .attr('id', `gradient-${type}`)
        .attr('cx', '30%')
        .attr('cy', '30%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(color!)!.brighter(0.5));

      gradient.append('stop').attr('offset', '100%').attr('stop-color', color!);
    });

    // Create simulation
    // Custom force to keep siblings horizontally aligned and close
    const nodeRadius = this.finalConfig.nodeRadius || 40;
    function siblingAlignForce(alpha: number) {
      return function () {
        // Group nodes by parentId
        const siblingsMap: { [parentId: string]: any[] } = {};
        flatNodes.forEach((node: any) => {
          if (node.parentId) {
            if (!siblingsMap[node.parentId]) siblingsMap[node.parentId] = [];
            siblingsMap[node.parentId].push(node);
          }
        });
        // For each sibling group, align y and keep x close
        Object.values(siblingsMap).forEach((siblings: any[]) => {
          if (siblings.length < 2) return;
          // Align y to the average
          const avgY = siblings.reduce((sum, n) => sum + (n.y || 0), 0) / siblings.length;
          siblings.forEach((n) => {
            n.y += (avgY - n.y) * 0.5 * alpha;
          });
          // Stack siblings vertically, same x, different y, below parent
          const spacing = nodeRadius * 2.2;
          // Find parent node's y (if available)
          let parentY = 0;
          let parentX = 0;
          if (siblings[0].parentId) {
            const parent = flatNodes.find((n) => n.id === siblings[0].parentId);
            if (parent && typeof (parent as any).y === 'number') parentY = (parent as any).y;
            else parentY = siblings[0].y;
            if (parent && typeof (parent as any).x === 'number') parentX = (parent as any).x;
            else parentX = siblings[0].x;
          } else {
            parentY = siblings[0].y;
            parentX = siblings[0].x;
          }
          // Center siblings vertically around parent
          const mid = (siblings.length - 1) / 2;
          siblings.forEach((n, i) => {
            const targetY = parentY + (i - mid) * spacing;
            n.x += (parentX - n.x) * 0.2 * alpha;
            n.y += (targetY - n.y) * 0.2 * alpha;
          });
        });
      };
    }

    this.simulation = d3
      .forceSimulation(flatNodes as any)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id((d: any) => d.id)
          .distance(this.finalConfig.linkDistance!)
      )
      .force('charge', d3.forceManyBody().strength(this.finalConfig.chargeStrength!))
      .force(
        'x',
        d3
          .forceX((d: any, i: number) => {
            const spacing = this.width / (flatNodes.length + 1);
            return spacing * (i + 1);
          })
          .strength(1)
      )
      .force('y', d3.forceY(this.height / 2).strength(1))
      .force('collision', d3.forceCollide().radius(this.finalConfig.collisionRadius!));
    //   .force('siblingAlign', siblingAlignForce(0.7));

    // Create links
    const linkElements = this.svg
      .append('g')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Create node groups
    const nodeGroups = this.svg
      .append('g')
      .selectAll('g')
      .data(flatNodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer');

    // For each node, check if it is a child (has parentId) and render accordingly
    nodeGroups.each((d: NetworkNode, i: number, nodes: any[]) => {
      const group = d3.select(nodes[i]);
      if (d.parentId) {
        // Find all siblings (children of the same parent)
        const siblings = this.nodes.find((n) => n.id === d.parentId)?.children || [];
        const idx = siblings.findIndex((child) => child.id === d.id);
        const count = siblings.length;
        // Calculate horizontal offset for justified layout
        const spacing = this.finalConfig.nodeRadius! * 2.2;
        const offset = (idx - (count - 1) / 2) * spacing;
        group.attr('transform', `translate(${offset},0)`);
        group
          .append('circle')
          .attr('r', this.finalConfig.nodeRadius! * 0.85)
          .attr('fill', '#dbeafe')
          .attr('stroke', 'none')
          .attr('stroke-width', 0)
          .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', '16px')
          .style('pointer-events', 'none')
          .text(this.getIcon(d.type));
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', this.finalConfig.nodeRadius! * 0.85 + 18)
          .attr('fill', '#374151')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .style('pointer-events', 'none')
          .text(d.label);
      } else if (d.children && d.children.length === 2) {
        // Compound node: draw invisible anchor, and visually group children
        group.append('circle').attr('r', 8).attr('fill', 'transparent');
        // Optionally, draw a bounding box or connector lines between children
      } else {
        // Single node (default)
        group
          .append('circle')
          .attr('r', this.finalConfig.nodeRadius!)
          .attr('fill', '#dbeafe')
          .attr('stroke', 'none')
          .attr('stroke-width', 0)
          .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', '18px')
          .style('pointer-events', 'none')
          .text(this.getIcon(d.type));
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', this.finalConfig.nodeRadius! + 20)
          .attr('fill', '#374151')
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .style('pointer-events', 'none')
          .text(d.label);
      }
    });

    // Add main circles
    nodeGroups
      .append('circle')
      .attr('r', this.finalConfig.nodeRadius!)
      .attr('fill', '#dbeafe') // Tailwind bg-blue-100
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))')
      .on('mouseover', (event: any, d: NetworkNode) => {
        // Scale up the node
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', this.finalConfig.nodeRadius! * 1.1)
          .style('filter', 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))');

        this.showHoverCard(event, d);
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', this.finalConfig.nodeRadius!)
          .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');

        this.hideHoverCard();
      });

    // Add highlight circles for depth effect
    nodeGroups
      .append('circle')
      .attr('r', this.finalConfig.nodeRadius! * 0.7)
      .attr('fill', 'rgba(255,255,255,0.2)')
      .style('pointer-events', 'none');

    // Add icons
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '18px')
      .style('pointer-events', 'none')
      .text((d: NetworkNode) => this.getIcon(d.type));

    // Add labels below nodes
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', this.finalConfig.nodeRadius! + 20)
      .attr('fill', '#374151')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .text((d: NetworkNode) => d.label);

    // Add sublabels (like IP addresses)
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', this.finalConfig.nodeRadius! + 35)
      .attr('fill', '#6b7280')
      .attr('font-size', '11px')
      .style('pointer-events', 'none')
      .text((d: NetworkNode) => d.sublabel || '');

    // Add warning badges for nodes with warnings
    const warningGroups = nodeGroups
      .filter((d: NetworkNode) => d.hasWarning)
      .append('g')
      .attr(
        'transform',
        `translate(${this.finalConfig.nodeRadius! * 0.7}, ${-this.finalConfig.nodeRadius! * 0.7})`
      );

    warningGroups
      .append('circle')
      .attr('r', 10)
      .attr('fill', this.finalConfig.colors!.warning!)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(239,68,68,0.3))');

    warningGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('!');

    // Add drag behavior
    const drag = d3
      .drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroups.call(drag);

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private showHoverCard(event: any, node: NetworkNode) {
    const containerRect = this.containerElement.nativeElement.getBoundingClientRect();
    const svgRect = this.svgElement.nativeElement.getBoundingClientRect();

    this.hoverPosition = {
      x: svgRect.left - containerRect.left + (node as any).x + this.finalConfig.nodeRadius!,
      y: svgRect.top - containerRect.top + (node as any).y - this.finalConfig.nodeRadius!,
    };

    this.hoveredNode = node;
  }

  private hideHoverCard() {
    this.hoveredNode = null;
  }

  getIcon(type: string): string {
    return this.finalConfig.icons![type as keyof typeof this.finalConfig.icons] || '❓';
  }

  getDetailsArray(details: { [key: string]: string }): { key: string; value: string }[] {
    return Object.entries(details).map(([key, value]) => ({ key, value }));
  }
}
