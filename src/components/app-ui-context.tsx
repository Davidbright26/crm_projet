"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AppUIContextValue {
  search: string;
  setSearch: (q: string) => void;
  toast: (message: string, isError?: boolean) => void;
}

const AppUIContext = createContext<AppUIContextValue | null>(null);

export function AppUIProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string, isError = false) => {
    setToastMsg(message);
    setToastError(isError);
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AppUIContext.Provider value={{ search, setSearch, toast }}>
      {children}
      {toastMsg !== null && (
        <div
          className={"toast" + (toastVisible ? " show" : "")}
          style={{ background: toastError ? "var(--red)" : "var(--text)" }}
        >
          {toastMsg}
        </div>
      )}
    </AppUIContext.Provider>
  );
}

export function useAppUI(): AppUIContextValue {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI must be used within AppUIProvider");
  return ctx;
}
