"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden fixed bottom-8 left-8 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm transition-all"
    >
      <Printer className="w-5 h-5" />
      <span>چاپ فاکتور</span>
    </button>
  );
}