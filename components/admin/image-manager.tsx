"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImageItem } from "./sortable-image-item";

type ImageItem = {
  id: string;
  url: string;
  file?: File;
};

type Props = {
  initialImages: ImageItem[];
  onChange: (images: ImageItem[]) => void;
};

export function ImageManager({ initialImages, onChange }: Props) {
  // تنظیم سنسور Pointer برای اینکه کلیک روی دکمه حذف باعث شروع درگ نشود
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = initialImages.findIndex((img) => img.id === active.id);
      const newIndex = initialImages.findIndex((img) => img.id === over.id);

      const newOrderedImages = arrayMove(initialImages, oldIndex, newIndex);
      onChange(newOrderedImages);
    }
  }

  const removeImage = (id: string) => {
    const updated = initialImages.filter((img) => img.id !== id);
    onChange(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={initialImages.map((img) => img.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {initialImages.map((img) => (
            <SortableImageItem
              key={img.id}
              id={img.id}
              url={img.url}
              onRemove={() => removeImage(img.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}