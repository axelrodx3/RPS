/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "@/design-system/components/Tabs";
import { renderWithProviders } from "@/test/render";

describe("Tabs", () => {
  it("shows FAQ content by default and switches to Modes", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Tabs
        defaultId="faq"
        items={[
          {
            id: "faq",
            label: "FAQ",
            content: <p>FAQ content visible</p>,
          },
          {
            id: "modes",
            label: "Modes",
            content: <p>Modes content visible</p>,
          },
        ]}
      />,
    );

    expect(screen.getByText("FAQ content visible")).toBeVisible();
    expect(screen.queryByText("Modes content visible")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Modes" }));

    expect(screen.getByText("Modes content visible")).toBeVisible();
    expect(screen.queryByText("FAQ content visible")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Modes" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
