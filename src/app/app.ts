import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { Graph } from './components/graph/graph';
import { NetworkNode } from './shared/interface/graph';
import { nodes } from './shared/data/graph';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Graph, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  hoveredMenu: string | null = null;
  protected readonly title = signal('spikerz');

  cardList = [{ title: 'Lorem P' }, { title: 'Lorem S' }, { title: 'Lorem T' }];
  networkNodes: NetworkNode[] = nodes;

  networkLinks: any[] = [
    { source: 'client', target: 'api' },
    { source: 'api', target: 'db' },
    { source: 'db', target: 'nodeA' },
    { source: 'db', target: 'nodeB' },
  ];

  customConfig: any = {
    nodeRadius: 20,
  };
}
