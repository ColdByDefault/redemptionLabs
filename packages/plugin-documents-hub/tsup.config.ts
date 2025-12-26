import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    manifest: "src/manifest.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "next/navigation",
    "lucide-react",
    "sonner",
    // Host app imports - these will be resolved by the main app
    "@/components/ui/button",
    "@/components/ui/table",
    "@/components/ui/dialog",
    "@/components/ui/input",
    "@/components/ui/label",
    "@/actions/document",
    "@/lib/document-utils",
    "@/lib/utils",
    "@/types/document",
  ],
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  noExternal: [],
});
