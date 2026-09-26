import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppImage from "./AppImage";

describe("AppImage", () => {
  it("renders the given src by default", () => {
    render(<AppImage src="https://example.com/a.png" alt="Producto" />);
    expect(screen.getByRole("img", { name: "Producto" })).toHaveAttribute(
      "src",
      "https://example.com/a.png"
    );
  });

  it("switches to the fallback once when the image fails to load", () => {
    render(
      <AppImage src="https://broken.example.com/a.png" alt="Producto" fallback="/local-fallback.png" />
    );

    var img = screen.getByRole("img", { name: "Producto" });
    fireEvent.error(img);

    expect(screen.getByRole("img", { name: "Producto" })).toHaveAttribute(
      "src",
      "/local-fallback.png"
    );
  });

  it("shows an accessible placeholder when there is no src and no fallback loads", () => {
    render(<AppImage src="" fallback="" alt="Sin imagen" />);
    expect(screen.getByRole("img", { name: "Sin imagen" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Sin imagen" }).tagName).toBe("DIV");
  });
});
