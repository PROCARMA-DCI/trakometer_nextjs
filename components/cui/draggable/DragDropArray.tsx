"use client";
import { cn } from "@/lib/utils";
import { useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface Props<T> {
  items?: T[];
  setItems?: Dispatch<SetStateAction<T[]>>;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

/** Drag-to-reorder list built on native HTML5 drag and drop (no extra package). */
function DragDropArray<T>({ items = [], setItems, renderItem, className }: Props<T>) {
  const from = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (to: number) => {
    const start = from.current;
    from.current = null;
    setOver(null);
    if (start === null || start === to || !setItems) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(start, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={index}
          draggable={!!setItems}
          onDragStart={() => (from.current = index)}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(index);
          }}
          onDragLeave={() => setOver((o) => (o === index ? null : o))}
          onDrop={() => drop(index)}
          onDragEnd={() => setOver(null)}
          className={cn(over === index && "bg-accent")}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default DragDropArray;
