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
import { NetworkNode } from '../../shared/interface/graph';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.html',
  imports: [CommonModule, FormsModule],
})
export class Graph implements OnInit, OnDestroy, OnChanges {
  @ViewChild('networkSvg', { static: true }) private svgElement!: ElementRef<SVGElement>;
  @ViewChild('container', { static: true }) private containerElement!: ElementRef<HTMLElement>;

  @Input() nodes: NetworkNode[] = [];
  @Input() links: any[] = [];
  @Input() config: any = {};
  @Input() width: number = 500;
  @Input() height: number = 350;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() classes?: string;

  hoveredNode: NetworkNode | null = null;
  hoverPosition = { x: 0, y: 0 };

  private svg: any;
  private simulation: any;
  private defaultConfig: any = {
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

  private get finalConfig(): any {
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

      // Only use d3.color if color is a string
      let brightColor = typeof color === 'string' ? d3.color(color)?.brighter(0.5) : null;
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', brightColor ? brightColor.toString() : (color as string));

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color as string);
    });

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

    // Render each node as a single image if iconUrl is present, otherwise fallback to a default circle and icon
    nodeGroups.each((d: NetworkNode, i: number, nodes: any[]) => {
      const group = d3.select(nodes[i]);
      group.selectAll('*').remove();
      if (d.iconUrl) {
        group
          .append('image')
          .attr('xlink:href', d.iconUrl)
          .attr('x', -this.finalConfig.nodeRadius!)
          .attr('y', -this.finalConfig.nodeRadius!)
          .attr('width', this.finalConfig.nodeRadius! * 2)
          .attr('height', this.finalConfig.nodeRadius! * 2);
      } else {
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
      }

      // Add label below the node (image or circle)
      group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('y', this.finalConfig.nodeRadius! + 18)
        .attr('fill', '#374151')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .style('pointer-events', 'none')
        .text(d.label);

      // Add sublabel below the main label if present
      if (d.sublabel) {
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', this.finalConfig.nodeRadius! + 34)
          .attr('fill', '#6b7280')
          .attr('font-size', '11px')
          .style('pointer-events', 'none')
          .text(d.sublabel);
      }

      // Add hover event listeners for hover card
      group
        .on('mouseover', (event: any) => {
          this.showHoverCard(event, d);
        })
        .on('mouseout', () => {
          this.hideHoverCard();
        });
    });

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
