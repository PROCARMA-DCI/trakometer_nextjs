import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import type { ClassNameType } from "./common_types";

export type ColumnKey = "title" | "accessor" | "filterId";

export type CellValue = string | number | Record<string, unknown> | null;

export interface ColumnType<T = Record<string, unknown>> {
  title: string;
  /** Dot path into the row, e.g. "customer.name". */
  accessor?: string;
  /** Enables the per-column filter input for this column. */
  filterId?: string;
  type?: "date" | "currency" | "text" | "number";
  currency?: string;
  format?: string;
  className?: ClassNameType;
  headerClassName?: ClassNameType;
  render?: (p: {
    row: T;
    index: number;
    data: T[];
    cell: CellValue;
  }) => ReactNode;
  renderTitle?: (p: { column: ColumnType<T>; index: number }) => ReactNode;
}

export interface ColumnFilterType {
  id: string;
  value: string;
}

export interface TableMainClassesType {
  tableClass?: ClassNameType;
  trHeadClass?: ClassNameType;
  tHeadClass?: ClassNameType;
  thHeadClass?: ClassNameType;
  tableInsideClass?: ClassNameType;
  tBodyClass?: ClassNameType;
  trBodyClass?: ClassNameType;
  tdBodyClass?: ClassNameType;
}

export type ExpandingTableType<T = Record<string, unknown>> = (
  item: T,
  index: number,
  data: T[],
) => ReactNode;

// ─── Actions (Sheet / Dialog / menus) ────────────────────────────────────────

export interface ActionType {
  removeSelection: () => void;
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  close: () => void;
  /** Report unsaved changes so closing asks for confirmation. */
  onDirtyChange: (dirty: boolean) => void;
}

export interface SizeType {
  default?: number | string;
  min?: number | string;
  max?: number | string;
}

export interface ActionStateTypes {
  Component: ReactNode | ((a: ActionType) => ReactNode);
  title: string;
  multiSelected?: boolean;
  resizable?: boolean;
  width?: SizeType;
  height?: SizeType;
  className?: ClassNameType;
  resizableClassName?: ClassNameType;
}

export interface ActionHandlerArgs {
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  removeSelection: () => void;
}

export interface ActionMenuList extends Partial<ActionStateTypes> {
  title: string;
  Icon?: React.ElementType;
  /** Show only when rows are selected / none are selected. Omit = always. */
  visible?: "selected" | "unselected";
  /** Open `Component` in a centered Dialog instead of the side Sheet. */
  modal?: boolean;
  disabled?: boolean;
  action?: (a: ActionHandlerArgs) => unknown;
  deleted?: (a: ActionHandlerArgs) => unknown;
}

export type ActionMenuListType<T = Record<string, unknown>> = (p: {
  rows: T[];
}) => ActionMenuList[];

export interface NewDropDownMenu {
  Trigger: () => ReactNode;
  contents: () => ActionMenuList[];
}

export interface NewActionMenu {
  dropdownMenu?: NewDropDownMenu[];
  click?: () => ActionMenuList;
  render?: () => ReactNode;
}

export type NewActionMenuType<T = Record<string, unknown>> = (p: {
  rows: T[];
}) => NewActionMenu[];

// ─── Tabs ────────────────────────────────────────────────────────────────────

export interface TableTabsType<T = Record<string, unknown>> {
  titleTable?: string | JSX.Element;
  columns: ColumnType<T>[];
  data: T[];
  total?: number;
  rowId?: string;
  actionMenuList?: ActionMenuListType<T>;
  newActionMenu?: NewActionMenuType<T>;
  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType<T>;
}

export type SetState<T> = Dispatch<SetStateAction<T>>;
