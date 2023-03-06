import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DataContextProvider } from "./Store/userData";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <DataContextProvider>
    <App></App>
  </DataContextProvider>
);
