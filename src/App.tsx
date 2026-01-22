import "./styles.css";
import { useState } from "preact/hooks";
import { DeclarativeGUITest } from "./demos/DeclarativeGUITest.tsx";

const stLabel: React.CSSProperties = { padding: "0 12px" };

function renderView(key: string) {
  // @ts-ignore
  const Comp = demos[key];
  return <Comp />;
}

function App() {
  return (
    <div style={{ padding: "12px" }}>
      <h3 style={{ color: "blue" }}>
        <a target="_blank" href="https://github.com/heluxjs/helux">
          helux
        </a>
        , a state library core that integrates atom, signal, collection dep,
        derive and watch, it supports all react like frameworks.
      </h3>
      <div style={{ padding: "12px" }}>
        <DeclarativeGUITest />
      </div>
    </div>
  );
}

export default App;
