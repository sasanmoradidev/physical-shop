"use client";

import { useState } from "react";
import Image from "next/image";

type ImageItem = {
  id?: string;
  url: string;
};

type Props = {
  initialImages: ImageItem[];
  onChange: (images: ImageItem[]) => void;
};

export function ImageManager({
  initialImages,
  onChange,
}: Props) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange(updated);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group border rounded-lg overflow-hidden"
          >
            <Image
              src={img.url}
              alt=""
              width={150}
              height={150}
              className="object-cover w-full h-24"
            />

            {/* delete button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}