export interface menuItem<T> {
  svgIcon: T;
  iconActive: T;
  label: string;
  isActive?: boolean;
}
