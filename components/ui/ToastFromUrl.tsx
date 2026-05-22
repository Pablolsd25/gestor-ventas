"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./toast";
import { useSearchParams } from "next/navigation";

export default function ToastFromUrl() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    const toastParam = searchParams.get("toast");
    if (toastParam) {
      shown.current = true;
      showToast(decodeURIComponent(toastParam.replace(/\+/g, " ")), "success");
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, showToast]);

  return null;
}
