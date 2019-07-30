export class ContextMenuItem {
  title: string;
  action: (index?: number) => void;
  disabled?: boolean;
}
