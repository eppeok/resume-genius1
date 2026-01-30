import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

interface TestRouterProps {
  children: ReactNode;
  initialEntries?: string[];
}

export function TestRouter({ children, initialEntries = ["/"] }: TestRouterProps) {
  return (
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </HelmetProvider>
  );
}
