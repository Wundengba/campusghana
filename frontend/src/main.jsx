import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GhanaCampus from "../GhanaCampus.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GhanaCampus />
  </StrictMode>
);
