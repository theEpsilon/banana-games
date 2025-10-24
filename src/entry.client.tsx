import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from "react-router/dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"

hydrateRoot(document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
)
