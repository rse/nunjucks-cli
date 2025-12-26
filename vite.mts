/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2025 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

import * as Vite          from "vite"
import { tscPlugin }      from "@wroud/vite-plugin-tsc"
import nodeExternals      from "rollup-plugin-node-externals"

export default Vite.defineConfig(({ command, mode }) => ({
    logLevel: "info",
    appType: "custom",
    base: "",
    root: "",
    plugins: [
        tscPlugin({
            tscArgs: [ "--project", "tsconfig.json", ...(mode === "development" ? [ "--sourceMap" ] : []) ],
            packageManager: "npx" as "npm",
            prebuild: true
        }),
        nodeExternals({
            builtins: true,
            devDeps:  false,
            deps:     false,
            optDeps:  false,
            peerDeps: false
        })
    ],
    resolve: {
        mainFields: [ "module", "jsnext:main", "jsnext" ],
        conditions: [ "node" ],
    },
    build: {
        lib: {
            entry:    "dst-stage1/nunjucks.js",
            formats:  [ "cjs" ],
            name:     "Nunjucks",
            fileName: () => "nunjucks.cjs"
        },
        target:                 "esnext",
        outDir:                 "dst-stage2",
        assetsDir:              "",
        emptyOutDir:            (mode === "production"),
        chunkSizeWarningLimit:  5000,
        assetsInlineLimit:      0,
        sourcemap:              (mode === "development"),
        minify:                 (mode === "production" ? "terser" : false),
        reportCompressedSize:   true,
        rollupOptions: {
            onwarn (warning, warn) {
                if (warning.message.match(/Use of eval.*?is strongly discouraged/))
                    return
                warn(warning)
            }
        }
    }
}))

