import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { AppGraphComponent, NetworkConfig, NetworkLink, NetworkNode } from './app-graph.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [CommonModule, AppGraphComponent, Sidebar],
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
      label: 'Client App',
      type: 'client',
      description: 'Frontend application handling user interactions',
      status: 'Active',
      details: { version: '2.1.0', uptime: '99.9%' },
    },
    {
      id: 'api',
      label: 'API Server',
      type: 'server',
      sublabel: 'api.example.com',
      description: 'Main API server handling business logic',
      status: 'Healthy',
      details: { cpu: '45%', memory: '68%', requests: '1.2k/min' },
    },
    {
      id: 'db',
      label: 'Database',
      type: 'database',
      sublabel: '192.168.1.10',
      hasWarning: true,
      description: 'Primary PostgreSQL database',
      status: 'Warning - High Load',
      details: { connections: '95/100', size: '2.3TB' },
    },
    {
      id: 'compound1',
      label: 'Cluster Node',
      type: 'server',
      children: [
        {
          id: 'nodeA',
          label: 'Node A',
          type: 'server',
          sublabel: '10.0.0.1',
          status: 'Active',
          details: { cpu: '30%', memory: '60%' },
        },
        {
          id: 'nodeB',
          label: 'Node B',
          type: 'database',
          sublabel: '10.0.0.2',
          status: 'Active',
          details: { size: '1.1TB', connections: '50/100' },
        },
      ],
      description: 'Cluster node with two elements',
      status: 'Active',
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
