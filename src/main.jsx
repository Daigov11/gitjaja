import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./routes/AppRouter";
import { NotificationsProvider } from "./components/Notifications";
import "./index.css";

var qc;
qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <NotificationsProvider>
        <AppRouter />
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
