module.exports = [
"[turbopack-node]/transforms/postcss.ts?config=[project]/soteria/postcss.config.mjs { CONFIG => \"[project]/soteria/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/1a6b_07qag9_._.js",
  "chunks/[root-of-the-server]__0dn-vg2._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts?config=[project]/soteria/postcss.config.mjs { CONFIG => \"[project]/soteria/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];