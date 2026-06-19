"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

type Props = {
  id: string;
  url: string;
  onRemove: () => void;
};

export function SortableImageItem({ id, url, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-lg overflow-hidden bg-gray-50 touch-none"
    >
      {/* بخش درگ اند دراپ با کلیک روی بدنه کارت تصویر */}
      <div
        {...attributes}
        {...listeners}
        className="w-full h-24 relative cursor-grab active:cursor-grabbing"
      >
        <Image
          src={url}
          alt=""
          fill
          sizes="150px"
          className="object-cover pointer-events-none"
        />
      </div>

      {/* دکمه حذف تصویر */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center z-20 shadow transition-opacity opacity-100 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}