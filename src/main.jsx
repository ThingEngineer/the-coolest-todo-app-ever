import { render } from "preact";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("app")
);
