import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ここでグローバル CSS を読み込む


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);