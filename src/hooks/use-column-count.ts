import { useEffect, useState } from "react";

const BREAKPOINTS: { minWidth: number; columns: number }[] = [
  { minWidth: 1280, columns: 5 },
  { minWidth: 1024, columns: 4 },
  { minWidth: 640, columns: 3 },
  { minWidth: 0, columns: 2 },
];

function getColumnCount(width: number) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth)?.columns ?? 2;
}

export function useColumnCount() {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    function handleResize() {
      setColumns(getColumnCount(window.innerWidth));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}
