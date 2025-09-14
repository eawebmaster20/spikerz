import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { topMenuList, bottomMenuList } from './shared/data/menu-list';
import { menuItem } from './shared/interface/menu';
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
  sidebarOpen = signal(false);
  get windowWidth() {
    return window.innerWidth;
  }

  hoveredMenu = signal<string | null>(null);
  protected readonly title = signal('spikerz');

  cardList = signal([{ title: 'Lorem P' }, { title: 'Lorem S' }, { title: 'Lorem T' }]);
  networkNodes = signal<NetworkNode[]>(nodes);

  networkLinks = signal<any[]>([
    { source: 'client', target: 'api' },
    { source: 'api', target: 'db' },
    { source: 'db', target: 'nodeA' },
    { source: 'db', target: 'nodeB' },
  ]);

  customConfig = signal<any>({
    nodeRadius: 20,
  });

  tpMenuItems: Array<menuItem<SafeHtml>> = [];
  btMenuItems: Array<menuItem<SafeHtml>> = [];

  constructor(private sanitizer: DomSanitizer) {
    this.tpMenuItems = topMenuList.map((item) => ({
      ...item,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml(item.svgIcon),
      iconActive: this.sanitizer.bypassSecurityTrustHtml(item.iconActive),
    }));
    this.btMenuItems = bottomMenuList.map((item) => ({
      ...item,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml(item.svgIcon),
      iconActive: this.sanitizer.bypassSecurityTrustHtml(item.iconActive),
    }));
  }
}
