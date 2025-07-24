import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dfxJson from '../../dfx.json';
import fs from 'fs';

const isDev = process.env["DFX_NETWORK"] !== "ic";

let canisterIds;
try {
  canisterIds = JSON.parse(fs.readFileSync(isDev ? "../../.dfx/local/canister_ids.json" : "../../canister_ids.json", "utf-8"));
} catch (e) {
  canisterIds = {};
}

const canisterDefinitions = Object.entries(dfxJson.canisters).reduce(
  (acc, [name, _value]) =>
    (name.includes("_frontend") || name.includes("internet_identity"))
      ? acc
      : {
          ...acc,
          ["process.env.CANISTER_ID_" + name.toUpperCase()]: JSON.stringify(canisterIds[name]?.[isDev ? "local" : "ic"] || ""),
        },
  {}
);

if (canisterIds.internet_identity && canisterIds.internet_identity[isDev ? "local" : "ic"]) {
    canisterDefinitions["process.env.CANISTER_ID_INTERNET_IDENTITY"] = JSON.stringify(canisterIds.internet_identity[isDev ? "local" : "ic"]);
} else {
    canisterDefinitions["process.env.CANISTER_ID_INTERNET_IDENTITY"] = JSON.stringify("rdmx6-jaaaa-aaaaa-aaadq-cai");
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...Object.fromEntries(
        Object.entries(dfxJson.canisters).filter(([, c]) => !c.type?.includes("assets")).map(([name]) => [
          `declarations/${name}`,
          path.resolve(__dirname, `../declarations/${name}`),
        ])
      ),
    },
  },
  define: {
    ...canisterDefinitions,
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943", // <-- Mudei de 8000 para 4943 aqui
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
    port: 3000,
  },
});