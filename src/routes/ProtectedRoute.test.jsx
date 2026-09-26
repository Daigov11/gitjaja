import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AUTH_USER_KEY } from "../state/auth";

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("redirects to /login when there is no valid session", () => {
    renderProtected();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects to /login when the stored session is invalid (no user id)", () => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({}));
    renderProtected();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected content when a valid session exists", () => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ usuario: "admin" }));
    renderProtected();
    expect(screen.getByText("Admin page")).toBeInTheDocument();
  });
});
