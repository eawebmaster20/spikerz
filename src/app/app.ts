import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { Graph } from './components/graph/graph';
import { NetworkConfig, NetworkLink, NetworkNode } from './shared/interface/graph';

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
  networkNodes: NetworkNode[] = [
    {
      id: 'client',
      label: 'Loremipsumm',
      type: 'client',
      description: 'Frontend application handling user interactions',
      status: 'Active',
      iconUrl: 'graph/1.svg',
      details: { version: '2.1.0', uptime: '99.9%' },
    },
    {
      id: 'api',
      label: 'Loremipsu',
      type: 'server',
      description: 'Main API server handling business logic',
      status: 'Healthy',
      iconUrl: 'graph/2.svg',
      details: { cpu: '45%', memory: '68%', requests: '1.2k/min' },
    },
    {
      id: 'db',
      label: 'Loremipsu',
      type: 'database',
      sublabel: '192.168.1.10',
      hasWarning: true,
      description: 'Primary PostgreSQL database',
      status: 'Warning - High Load',
      iconUrl: 'graph/2.svg',
      details: { connections: '95/100', size: '2.3TB' },
    },
    {
      id: 'compound1',
      label: 'Cluster Node',
      type: 'server',
      children: [
        {
          id: 'nodeA',
          label: 'Loremipsumdolorsit',
          type: 'server',
          sublabel: '192.168.1.1',
          status: 'Active',
          iconUrl: 'graph/2_alt.svg',
          details: { cpu: '30%', memory: '60%' },
        },
        {
          id: 'nodeB',
          label: 'Loremipsumdolorsit002',
          type: 'database',
          sublabel: '192.168.1.2',
          status: 'Active',
          iconUrl: 'graph/2_alt.svg',
          details: { size: '1.1TB', connections: '50/100' },
        },
      ],
      description: 'Cluster node with two elements',
      status: 'Active',
      iconUrl: 'assets/server.png',
    },
  ];

  networkLinks: NetworkLink[] = [
    { source: 'client', target: 'api' },
    { source: 'api', target: 'db' },
    { source: 'db', target: 'nodeA' },
    { source: 'db', target: 'nodeB' },
  ];

  customConfig: NetworkConfig = {
    nodeRadius: 20,
  };
}
