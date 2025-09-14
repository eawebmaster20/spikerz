import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { bottomMenuList, topMenuList } from '../../shared/data/menu-list';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { menuItem } from '../../shared/interface/menu';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  opened: boolean = true;
  asideHovered: boolean = false;
  selectedMenuItem = signal<string>('dashboard');

  btMenuItems: menuItem<SafeHtml>[] = [];
  tpMenuItems: menuItem<SafeHtml>[] = [];

  constructor(private sanitizer: DomSanitizer) {}
  ngOnInit() {
    this.btMenuItems = bottomMenuList.map((item) => ({
      ...item,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml(item.svgIcon),
      iconActive: this.sanitizer.bypassSecurityTrustHtml(item.iconActive),
    }));

    this.tpMenuItems = topMenuList.map((item) => ({
      ...item,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml(item.svgIcon),
      iconActive: this.sanitizer.bypassSecurityTrustHtml(item.iconActive),
    }));
    this.selectedMenuItem.set(this.tpMenuItems[3].label);
    this.tpMenuItems[3].isActive = true;
  }
}
