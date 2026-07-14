import { render, type RenderOptions } from "@testing-library/react";
import { AppProviders } from "@/providers/AppProviders";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }) => <AppProviders>{children}</AppProviders>,
    ...options,
  });
}
