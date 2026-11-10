import { ClassNameType } from "@/lib/common_types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import DropdownList from "../../DropdownList";

export interface PaginationType {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dataLimit: number;
  setDataLimit: (limit: number) => void;
  total?: number;
  /** Hide the rows-per-page picker (page size is fixed by the server). */
  hideLimit?: boolean;
  className?: ClassNameType;
}
const Pagination = ({
  currentPage = 1,
  setCurrentPage,
  setDataLimit,
  dataLimit,
  total = dataLimit,
  hideLimit,
  className,
}: PaginationType) => {
  // Handle rows per page
  const handledataLimitChange = (size: number) => {
    setDataLimit(size);
    setCurrentPage(1); // Reset to first page with new rows per page
  };

  return (
    <div
      className={cn(
        "sticky right-0 bottom-0 z-10 flex w-full flex-wrap items-center justify-between gap-2 border-t border-border bg-background p-2",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="select-none text-sm font-bold">Total: {total}</span>
        {!hideLimit && (
          <DropdownList
            Trigger={() => (
              <div className="select-none rounded-md border border-border px-2 py-1 text-sm transition hover:bg-accent">
                Limit {dataLimit}
              </div>
            )}
            contents={[10, 20, 50, 100, 500, 1000, total]
              .filter((size) => size <= total)
              .map((size) => ({
                title: `${size} `,
                click: () => handledataLimitChange(size),
              }))}
            contentsWrapClass="w-32"
          />
        )}
      </div>
      <PaginationNumber
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        dataLimit={dataLimit}
        total={total}
      />
    </div>
  );
};

/** "Go to [ n ] of N": type a page and press Enter / Go. Out-of-range values are clamped. */
const PageJump = ({
  currentPage,
  pageCount,
  onJump,
}: {
  currentPage: number;
  pageCount: number;
  onJump: (page: number) => void;
}) => {
  const [value, setValue] = useState("");
  const go = () => {
    const n = Math.round(Number(value));
    if (!value || Number.isNaN(n)) return;
    const page = Math.min(Math.max(n, 1), pageCount);
    setValue("");
    if (page !== currentPage) onJump(page);
  };
  return (
    <form
      className="flex flex-col items-center gap-0.5 text-muted-foreground"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <Input
        type="number"
        min={1}
        max={pageCount}
        inputMode="numeric"
        enterKeyHint="go"
        value={value}
        placeholder={`${pageCount}`}
        title={`(1–${pageCount}), press Enter`}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Go to page"
        className="h-7 w-8 px-1 text-center text-xs [appearance:textfield] placeholder:text-[10px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </form>
  );
};

export const PaginationNumber = ({
  setCurrentPage,
  currentPage,
  dataLimit,
  total = dataLimit,
  className,
}: {
  setCurrentPage: (page: number) => void;
  currentPage: number;
  dataLimit: number;
  total: number;
  className?: ClassNameType;
}) => {
  const pageCount = Math.ceil(total / dataLimit);
  if (pageCount <= 0) return null;
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    let leftSide = currentPage - 2;
    let rightSide = currentPage + 2;

    if (leftSide <= 1) {
      rightSide = 5;
      leftSide = 1;
    }
    if (rightSide > pageCount) {
      leftSide = pageCount - 4;
      rightSide = pageCount;
      if (leftSide < 1) {
        leftSide = 1;
      }
    }

    for (let number = leftSide; number <= rightSide; number++) {
      if (number > 0 && number <= pageCount) {
        pages.push(number);
      }
    }
    return pages;
  };
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-end gap-1 select-none",
        className,
      )}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        {"<<"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="  "
      >
        {"<"}
      </Button>
      {getPageNumbers().map((number) => (
        <Button
          key={number}
          variant={number === currentPage ? "default" : "secondary"}
          size="sm"
          onClick={() => handlePageChange(number)}
          className={
            number === currentPage ? "font-bold pointer-events-none" : ""
          }
        >
          {number}
        </Button>
      ))}
      {currentPage < pageCount - 2 && (
        <span className="mx-1 text-muted-foreground">…</span>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageCount}
      >
        {">"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(pageCount)}
        disabled={currentPage === pageCount}
      >
        {">>"}
      </Button>
      {pageCount > 5 && (
        <div className=" ">
          <PageJump
            currentPage={currentPage}
            pageCount={pageCount}
            onJump={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;
