/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_font_google_target_css_path_src_pages_app_tsx_import_Inter_arguments_subsets_latin_cyrillic_variable_font_inter_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/font/google/target.css?{\"path\":\"src\\\\pages\\\\_app.tsx\",\"import\":\"Inter\",\"arguments\":[{\"subsets\":[\"latin\",\"cyrillic\"],\"variable\":\"--font-inter\",\"display\":\"swap\"}],\"variableName\":\"inter\"} */ \"./node_modules/next/font/google/target.css?{\\\"path\\\":\\\"src\\\\\\\\pages\\\\\\\\_app.tsx\\\",\\\"import\\\":\\\"Inter\\\",\\\"arguments\\\":[{\\\"subsets\\\":[\\\"latin\\\",\\\"cyrillic\\\"],\\\"variable\\\":\\\"--font-inter\\\",\\\"display\\\":\\\"swap\\\"}],\\\"variableName\\\":\\\"inter\\\"}\");\n/* harmony import */ var next_font_google_target_css_path_src_pages_app_tsx_import_Inter_arguments_subsets_latin_cyrillic_variable_font_inter_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_font_google_target_css_path_src_pages_app_tsx_import_Inter_arguments_subsets_latin_cyrillic_variable_font_inter_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_font_google_target_css_path_src_pages_app_tsx_import_JetBrains_Mono_arguments_subsets_latin_variable_font_jetbrains_mono_display_swap_variableName_jetbrainsMono___WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/font/google/target.css?{\"path\":\"src\\\\pages\\\\_app.tsx\",\"import\":\"JetBrains_Mono\",\"arguments\":[{\"subsets\":[\"latin\"],\"variable\":\"--font-jetbrains-mono\",\"display\":\"swap\"}],\"variableName\":\"jetbrainsMono\"} */ \"./node_modules/next/font/google/target.css?{\\\"path\\\":\\\"src\\\\\\\\pages\\\\\\\\_app.tsx\\\",\\\"import\\\":\\\"JetBrains_Mono\\\",\\\"arguments\\\":[{\\\"subsets\\\":[\\\"latin\\\"],\\\"variable\\\":\\\"--font-jetbrains-mono\\\",\\\"display\\\":\\\"swap\\\"}],\\\"variableName\\\":\\\"jetbrainsMono\\\"}\");\n/* harmony import */ var next_font_google_target_css_path_src_pages_app_tsx_import_JetBrains_Mono_arguments_subsets_latin_variable_font_jetbrains_mono_display_swap_variableName_jetbrainsMono___WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_font_google_target_css_path_src_pages_app_tsx_import_JetBrains_Mono_arguments_subsets_latin_variable_font_jetbrains_mono_display_swap_variableName_jetbrainsMono___WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"@solana/wallet-adapter-react\");\n/* harmony import */ var _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui */ \"@solana/wallet-adapter-react-ui\");\n/* harmony import */ var _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @solana/wallet-adapter-wallets */ \"@solana/wallet-adapter-wallets\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__]);\n([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n// Import wallet adapter CSS\n__webpack_require__(/*! @solana/wallet-adapter-react-ui/styles.css */ \"./node_modules/@solana/wallet-adapter-react-ui/styles.css\");\nfunction App({ Component, pageProps }) {\n    // Set to mainnet-beta\n    const network = \"mainnet-beta\";\n    // You can also provide a custom RPC endpoint\n    const endpoint = (0,react__WEBPACK_IMPORTED_MODULE_5__.useMemo)(()=>{\n        // Use Solana's public RPC endpoint for mainnet-beta\n        return \"https://api.mainnet-beta.solana.com\";\n    }, []);\n    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading\n    const wallets = (0,react__WEBPACK_IMPORTED_MODULE_5__.useMemo)(()=>[\n            new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__.PhantomWalletAdapter(),\n            new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__.SolflareWalletAdapter()\n        ], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__.ConnectionProvider, {\n        endpoint: endpoint,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__.WalletProvider, {\n            wallets: wallets,\n            autoConnect: true,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__.WalletModalProvider, {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n                    className: `${(next_font_google_target_css_path_src_pages_app_tsx_import_Inter_arguments_subsets_latin_cyrillic_variable_font_inter_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6___default().variable)} ${(next_font_google_target_css_path_src_pages_app_tsx_import_JetBrains_Mono_arguments_subsets_latin_variable_font_jetbrains_mono_display_swap_variableName_jetbrainsMono___WEBPACK_IMPORTED_MODULE_7___default().variable)} font-sans`,\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\user\\\\meteora-monitor\\\\src\\\\pages\\\\_app.tsx\",\n                        lineNumber: 50,\n                        columnNumber: 7\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\user\\\\meteora-monitor\\\\src\\\\pages\\\\_app.tsx\",\n                    lineNumber: 49,\n                    columnNumber: 5\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\user\\\\meteora-monitor\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 48,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\user\\\\meteora-monitor\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 47,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\meteora-monitor\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 46,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYU1BO0FBTUFDO0FBbkJ1QjtBQUlvRDtBQUNaO0FBQ3VCO0FBRTdEO0FBRS9CLDRCQUE0QjtBQUM1Qk8sbUJBQU9BLENBQUM7QUFjTyxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQzVELHNCQUFzQjtJQUN0QixNQUFNQyxVQUFVO0lBRWhCLDZDQUE2QztJQUM3QyxNQUFNQyxXQUFXTiw4Q0FBT0EsQ0FBQztRQUN2QixvREFBb0Q7UUFDcEQsT0FBTztJQUNULEdBQUcsRUFBRTtJQUVMLHNHQUFzRztJQUN0RyxNQUFNTyxVQUFVUCw4Q0FBT0EsQ0FDckIsSUFBTTtZQUNKLElBQUlGLGdGQUFvQkE7WUFDeEIsSUFBSUMsaUZBQXFCQTtTQUMxQixFQUNELEVBQUU7SUFHSixxQkFDRSw4REFBQ0osNEVBQWtCQTtRQUFDVyxVQUFVQTtrQkFDNUIsNEVBQUNWLHdFQUFjQTtZQUFDVyxTQUFTQTtZQUFTQyxXQUFXO3NCQUMzQyw0RUFBQ1gsZ0ZBQW1CQTswQkFDeEIsNEVBQUNZO29CQUFLQyxXQUFXLENBQUMsRUFBRWpCLHVNQUFjLENBQUMsQ0FBQyxFQUFFQyx3TkFBc0IsQ0FBQyxVQUFVLENBQUM7OEJBQ3RFLDRFQUFDUzt3QkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU05QiIsInNvdXJjZXMiOlsid2VicGFjazovL21ldGVvcmEtbW9uaXRvci8uL3NyYy9wYWdlcy9fYXBwLnRzeD9mOWQ2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnQC9zdHlsZXMvZ2xvYmFscy5jc3MnXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnXG5pbXBvcnQgeyBJbnRlciwgSmV0QnJhaW5zX01vbm8gfSBmcm9tICduZXh0L2ZvbnQvZ29vZ2xlJ1xuaW1wb3J0IHsgV2FsbGV0QWRhcHRlck5ldHdvcmsgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLWJhc2UnXG5pbXBvcnQgeyBDb25uZWN0aW9uUHJvdmlkZXIsIFdhbGxldFByb3ZpZGVyIH0gZnJvbSAnQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdCdcbmltcG9ydCB7IFdhbGxldE1vZGFsUHJvdmlkZXIgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0LXVpJ1xuaW1wb3J0IHsgUGhhbnRvbVdhbGxldEFkYXB0ZXIsIFNvbGZsYXJlV2FsbGV0QWRhcHRlciB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItd2FsbGV0cydcbmltcG9ydCB7IGNsdXN0ZXJBcGlVcmwgfSBmcm9tICdAc29sYW5hL3dlYjMuanMnXG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5cbi8vIEltcG9ydCB3YWxsZXQgYWRhcHRlciBDU1NcbnJlcXVpcmUoJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItcmVhY3QtdWkvc3R5bGVzLmNzcycpXG5cbmNvbnN0IGludGVyID0gSW50ZXIoe1xuICBzdWJzZXRzOiBbJ2xhdGluJywgJ2N5cmlsbGljJ10sXG4gIHZhcmlhYmxlOiAnLS1mb250LWludGVyJyxcbiAgZGlzcGxheTogJ3N3YXAnLFxufSlcblxuY29uc3QgamV0YnJhaW5zTW9ubyA9IEpldEJyYWluc19Nb25vKHtcbiAgc3Vic2V0czogWydsYXRpbiddLFxuICB2YXJpYWJsZTogJy0tZm9udC1qZXRicmFpbnMtbW9ubycsXG4gIGRpc3BsYXk6ICdzd2FwJyxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIC8vIFNldCB0byBtYWlubmV0LWJldGFcbiAgY29uc3QgbmV0d29yayA9ICdtYWlubmV0LWJldGEnIGFzIFdhbGxldEFkYXB0ZXJOZXR3b3JrXG5cbiAgLy8gWW91IGNhbiBhbHNvIHByb3ZpZGUgYSBjdXN0b20gUlBDIGVuZHBvaW50XG4gIGNvbnN0IGVuZHBvaW50ID0gdXNlTWVtbygoKSA9PiB7XG4gICAgLy8gVXNlIFNvbGFuYSdzIHB1YmxpYyBSUEMgZW5kcG9pbnQgZm9yIG1haW5uZXQtYmV0YVxuICAgIHJldHVybiAnaHR0cHM6Ly9hcGkubWFpbm5ldC1iZXRhLnNvbGFuYS5jb20nXG4gIH0sIFtdKVxuXG4gIC8vIEBzb2xhbmEvd2FsbGV0LWFkYXB0ZXItd2FsbGV0cyBpbmNsdWRlcyBhbGwgdGhlIGFkYXB0ZXJzIGJ1dCBzdXBwb3J0cyB0cmVlIHNoYWtpbmcgYW5kIGxhenkgbG9hZGluZ1xuICBjb25zdCB3YWxsZXRzID0gdXNlTWVtbyhcbiAgICAoKSA9PiBbXG4gICAgICBuZXcgUGhhbnRvbVdhbGxldEFkYXB0ZXIoKSxcbiAgICAgIG5ldyBTb2xmbGFyZVdhbGxldEFkYXB0ZXIoKSxcbiAgICBdLFxuICAgIFtdXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxDb25uZWN0aW9uUHJvdmlkZXIgZW5kcG9pbnQ9e2VuZHBvaW50fT5cbiAgICAgIDxXYWxsZXRQcm92aWRlciB3YWxsZXRzPXt3YWxsZXRzfSBhdXRvQ29ubmVjdD5cbiAgICAgICAgPFdhbGxldE1vZGFsUHJvdmlkZXI+XG4gICAgPG1haW4gY2xhc3NOYW1lPXtgJHtpbnRlci52YXJpYWJsZX0gJHtqZXRicmFpbnNNb25vLnZhcmlhYmxlfSBmb250LXNhbnNgfT5cbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICA8L21haW4+XG4gICAgICAgIDwvV2FsbGV0TW9kYWxQcm92aWRlcj5cbiAgICAgIDwvV2FsbGV0UHJvdmlkZXI+XG4gICAgPC9Db25uZWN0aW9uUHJvdmlkZXI+XG4gIClcbn0gIl0sIm5hbWVzIjpbImludGVyIiwiamV0YnJhaW5zTW9ubyIsIkNvbm5lY3Rpb25Qcm92aWRlciIsIldhbGxldFByb3ZpZGVyIiwiV2FsbGV0TW9kYWxQcm92aWRlciIsIlBoYW50b21XYWxsZXRBZGFwdGVyIiwiU29sZmxhcmVXYWxsZXRBZGFwdGVyIiwidXNlTWVtbyIsInJlcXVpcmUiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJuZXR3b3JrIiwiZW5kcG9pbnQiLCJ3YWxsZXRzIiwiYXV0b0Nvbm5lY3QiLCJtYWluIiwiY2xhc3NOYW1lIiwidmFyaWFibGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@solana/wallet-adapter-react":
/*!***********************************************!*\
  !*** external "@solana/wallet-adapter-react" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react");;

/***/ }),

/***/ "@solana/wallet-adapter-react-ui":
/*!**************************************************!*\
  !*** external "@solana/wallet-adapter-react-ui" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react-ui");;

/***/ }),

/***/ "@solana/wallet-adapter-wallets":
/*!*************************************************!*\
  !*** external "@solana/wallet-adapter-wallets" ***!
  \*************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-wallets");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@solana"], () => (__webpack_exec__("./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();