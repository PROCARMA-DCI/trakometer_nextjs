import React, { useState } from "react";

import {
  actionMenuContents,
  filterActionMenuCondition,
  openComponentAction,
} from "./function";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../ui/sheet";
import { cn } from "../../../../lib/utils";
import { ClassNameType } from "@/lib/common_types";
import {
  ActionMenuList,
  ActionMenuListType,
  ActionStateTypes,
  ColumnType,
  NewActionMenuType,
  NewDropDownMenu,
} from "@/lib/table_types";
import { FileDown, LayoutList } from "lucide-react";
import DropdownList from "../../DropdownList";
import {
  ExportCsvRow,
  handleArrangeCsvData,
  handleExportCsv,
} from "../components/generateExcel";

interface TableHeaderActionType {
  data: Record<string, unknown>[];
  actionMenuList?: ActionMenuListType;
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  newActionMenu?: NewActionMenuType;
  removeSelection: () => void;
  columns: ColumnType[];
  className?: ClassNameType;
  children?: React.ReactNode;
}

const emptyContent: ActionStateTypes = {
  Component: <></>,
  title: "",
  multiSelected: false,
};

const TableHeaderAction = ({
  className,
  data,
  columns,
  actionMenuList,
  selectedRows,
  setSelectedRows,
  newActionMenu,
  removeSelection,
  children,
}: TableHeaderActionType) => {
  // Sheet (side drawer) state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContentRaw] =
    useState<ActionStateTypes>(emptyContent);

  // Dialog (centered modal) state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContentRaw] =
    useState<ActionStateTypes>(emptyContent);

  // Whether the currently-open Sheet/Dialog's rendered form has unsaved
  // changes — reported via ActionType.onDirtyChange. Guards close attempts
  // (X button, overlay click, ESC) behind a confirm prompt.
  const [dirty, setDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState<"sheet" | "dialog" | null>(
    null,
  );

  // Opening a new item's content always starts clean.
  const setSheetContent: typeof setSheetContentRaw = (value) => {
    setDirty(false);
    setSheetContentRaw(value);
  };
  const setDialogContent: typeof setDialogContentRaw = (value) => {
    setDirty(false);
    setDialogContentRaw(value);
  };

  const toggleSheet = (open?: boolean) =>
    setSheetOpen((prev) => (open !== undefined ? open : !prev));

  const toggleDialog = (open?: boolean) =>
    setDialogOpen((prev) => (open !== undefined ? open : !prev));

  const guardedOpenChange = (target: "sheet" | "dialog", next: boolean) => {
    // While the confirm prompt is up, clicking it registers as an "outside"
    // interaction on the Sheet/Dialog underneath (separate Radix portal),
    // which re-fires this with next=false — ignore it so the prompt doesn't
    // immediately reopen itself right after "Keep editing" closes it.
    if (pendingClose !== null) return;
    if (!next && dirty) {
      setPendingClose(target);
      return;
    }
    if (target === "sheet") setSheetOpen(next);
    else setDialogOpen(next);
  };

  const confirmDiscardClose = () => {
    if (pendingClose === "sheet") setSheetOpen(false);
    else if (pendingClose === "dialog") setDialogOpen(false);
    setDirty(false);
    setPendingClose(null);
  };

  const handleActionMenuContents = (
    listCondition: ActionMenuList[] | undefined,
  ) =>
    actionMenuContents(
      listCondition,
      selectedRows,
      setSelectedRows,
      () => toggleSheet(),
      setSheetContent,
      removeSelection,
      () => toggleDialog(),
      setDialogContent,
    );

  const renderDropdowns = (actionMenu: NewDropDownMenu[]): React.ReactNode[] =>
    actionMenu.map((menu, index) => {
      const listCondition = filterActionMenuCondition(
        menu.contents(),
        selectedRows,
      );
      if (!listCondition || listCondition.length === 0) return null;
      return (
        <DropdownList
          key={index}
          Trigger={menu.Trigger}
          contents={handleActionMenuContents(listCondition)}
        />
      );
    });

  const mainActionMenu = actionMenuList
    ? actionMenuList({ rows: selectedRows })
    : undefined;
  const menuListCondition = filterActionMenuCondition(
    mainActionMenu,
    selectedRows,
  );

  const ExportHandle: NewDropDownMenu[] = [
    {
      Trigger: () => <FileDown size={16} />,
      contents: () => [
        {
          title: "Export All",
          Icon: FileDown,
          action: () => handleExportCsv(data as ExportCsvRow[]),
        },
        {
          title: "Export Selected",
          Icon: FileDown,
          action: () => handleArrangeCsvData(selectedRows, columns),
          visible: "selected",
          multiSelected: true,
        },
      ],
    },
  ];

  const renderComponent = (state: ActionStateTypes, close: () => void) =>
    typeof state.Component === "function"
      ? state.Component({
          removeSelection,
          selectedRows,
          setSelectedRows,
          close,
          onDirtyChange: setDirty,
        })
      : state.Component;

  // A NewActionMenu.click item describes itself as an ActionMenuList entry
  // (title/Icon/Component/modal) instead of building its own trigger + Sheet
  // or Dialog — this renders that trigger and opens it into the shared ones.
  const renderClickTrigger = (getItem: () => ActionMenuList, index: number) => {
    const item = getItem(); //we did click is the function itself for future if we need to pass something
    return (
      <Button
        key={index}
        size="sm"
        className={cn("h-7 gap-1 text-xs", item?.className)}
        disabled={item?.disabled}
        onClick={() =>
          openComponentAction(
            item,
            () => toggleSheet(),
            setSheetContent,
            () => toggleDialog(),
            setDialogContent,
          )
        }
      >
        {item.Icon && <item.Icon size={12} />}
        {item.title}
      </Button>
    );
  };

  return (
    <>
      <div className={`flex items-center gap-1 ${className ?? ""}`}>
        {menuListCondition && menuListCondition.length > 0 && (
          <DropdownList
            Trigger={() => <LayoutList size={16} />}
            contents={handleActionMenuContents(menuListCondition)}
          />
        )}

        {newActionMenu &&
          newActionMenu({
            rows: selectedRows,
          }).map((item, index) => (
            <React.Fragment key={index}>
              {item.dropdownMenu && renderDropdowns(item.dropdownMenu)}
              {item.click && renderClickTrigger(item.click, index)}
              {item.render && item.render()}
            </React.Fragment>
          ))}

        {renderDropdowns(ExportHandle)}
        {children}
      </div>

      {/* Side drawer — default for Component items */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(next) => guardedOpenChange("sheet", next)}
      >
        <SheetContent
          side="right"
          style={{
            width: sheetContent.width?.default,
            minWidth: sheetContent.width?.min,
            maxWidth: sheetContent.width?.max,
          }}
          className={cn(sheetContent.className, sheetContent.resizableClassName)}
        >
          <SheetHeader>
            <SheetTitle>{sheetContent.title}</SheetTitle>
          </SheetHeader>
          <SheetBody>
            {renderComponent(sheetContent, () => toggleSheet(false))}
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Centered dialog — for items with modal: true */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => guardedOpenChange("dialog", next)}
      >
        <DialogContent
          style={{
            width: dialogContent.width?.default,
            minWidth: dialogContent.width?.min,
            maxWidth: dialogContent.width?.max,
            height: dialogContent.height?.default,
            minHeight: dialogContent.height?.min,
            maxHeight: dialogContent.height?.max,
          }}
          className={cn(dialogContent.className, dialogContent.resizableClassName)}
        >
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          <DialogBody className="py-2">
            {renderComponent(dialogContent, () => toggleDialog(false))}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* On Dirty Change */}
      <AlertDialog
        open={pendingClose !== null}
        onOpenChange={(next) => !next && setPendingClose(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Closing now will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingClose(null)}
            >
              Keep editing
            </Button>
            <Button type="button" onClick={confirmDiscardClose}>
              Discard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableHeaderAction;
