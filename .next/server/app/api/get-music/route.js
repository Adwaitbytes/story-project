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
exports.id = "app/api/get-music/route";
exports.ids = ["app/api/get-music/route"];
exports.modules = {

/***/ "(rsc)/./app/api/get-music/route.ts":
/*!************************************!*\
  !*** ./app/api/get-music/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst STORAGE_FILE = path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), 'music-storage.json');\nfunction readStorage() {\n    try {\n        if (fs__WEBPACK_IMPORTED_MODULE_1___default().existsSync(STORAGE_FILE)) {\n            const data = fs__WEBPACK_IMPORTED_MODULE_1___default().readFileSync(STORAGE_FILE, 'utf8');\n            return JSON.parse(data);\n        }\n        return [];\n    } catch (error) {\n        console.error('❌ Error reading storage:', error);\n        return [];\n    }\n}\nasync function GET() {\n    console.log('📂 Loading music NFTs from storage...');\n    try {\n        const musicData = readStorage();\n        console.log('✅ Loaded', musicData.length, 'music NFTs');\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            music: musicData\n        });\n    } catch (error) {\n        console.error('💥 Error loading music:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: 'Failed to load music',\n            music: []\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2dldC1tdXNpYy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDMEM7QUFDdkI7QUFDSTtBQWlCdkIsTUFBTUcsZUFBZUQsZ0RBQVMsQ0FBQ0csUUFBUUMsR0FBRyxJQUFJO0FBRTlDLFNBQVNDO0lBQ1AsSUFBSTtRQUNGLElBQUlOLG9EQUFhLENBQUNFLGVBQWU7WUFDL0IsTUFBTU0sT0FBT1Isc0RBQWUsQ0FBQ0UsY0FBYztZQUMzQyxPQUFPUSxLQUFLQyxLQUFLLENBQUNIO1FBQ3BCO1FBQ0EsT0FBTyxFQUFFO0lBQ1gsRUFBRSxPQUFPSSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw0QkFBNEJBO1FBQzFDLE9BQU8sRUFBRTtJQUNYO0FBQ0Y7QUFFTyxlQUFlRTtJQUNwQkQsUUFBUUUsR0FBRyxDQUFDO0lBRVosSUFBSTtRQUNGLE1BQU1DLFlBQVlWO1FBQ2xCTyxRQUFRRSxHQUFHLENBQUMsWUFBWUMsVUFBVUMsTUFBTSxFQUFFO1FBRTFDLE9BQU9sQixxREFBWUEsQ0FBQ21CLElBQUksQ0FBQztZQUN2QkMsU0FBUztZQUNUQyxPQUFPSjtRQUNUO0lBQ0YsRUFBRSxPQUFPSixPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQywyQkFBMkJBO1FBRXpDLE9BQU9iLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO1lBQ3ZCQyxTQUFTO1lBQ1RQLE9BQU87WUFDUFEsT0FBTyxFQUFFO1FBQ1gsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDbkI7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxhZHdhaVxcc3RvcnktdzNcXGFwcFxcYXBpXFxnZXQtbXVzaWNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbnRlcmZhY2UgTXVzaWNEYXRhIHtcbiAgaWQ6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIGFydGlzdDogc3RyaW5nXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmdcbiAgcHJpY2U6IHN0cmluZ1xuICBhdWRpb1VybDogc3RyaW5nXG4gIGltYWdlVXJsOiBzdHJpbmdcbiAgb3duZXI6IHN0cmluZ1xuICBtZXRhZGF0YVVybDogc3RyaW5nXG4gIGNyZWF0ZWRBdDogc3RyaW5nXG4gIGlwSWQ/OiBzdHJpbmdcbiAgdHhIYXNoPzogc3RyaW5nXG59XG5cbmNvbnN0IFNUT1JBR0VfRklMRSA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbXVzaWMtc3RvcmFnZS5qc29uJylcblxuZnVuY3Rpb24gcmVhZFN0b3JhZ2UoKTogTXVzaWNEYXRhW10ge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFNUT1JBR0VfRklMRSkpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoU1RPUkFHRV9GSUxFLCAndXRmOCcpXG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKVxuICAgIH1cbiAgICByZXR1cm4gW11cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgcmVhZGluZyBzdG9yYWdlOicsIGVycm9yKVxuICAgIHJldHVybiBbXVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIGNvbnNvbGUubG9nKCfwn5OCIExvYWRpbmcgbXVzaWMgTkZUcyBmcm9tIHN0b3JhZ2UuLi4nKVxuICBcbiAgdHJ5IHtcbiAgICBjb25zdCBtdXNpY0RhdGEgPSByZWFkU3RvcmFnZSgpXG4gICAgY29uc29sZS5sb2coJ+KchSBMb2FkZWQnLCBtdXNpY0RhdGEubGVuZ3RoLCAnbXVzaWMgTkZUcycpXG4gICAgXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtdXNpYzogbXVzaWNEYXRhLFxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign8J+SpSBFcnJvciBsb2FkaW5nIG11c2ljOicsIGVycm9yKVxuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGxvYWQgbXVzaWMnLFxuICAgICAgbXVzaWM6IFtdLFxuICAgIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImZzIiwicGF0aCIsIlNUT1JBR0VfRklMRSIsImpvaW4iLCJwcm9jZXNzIiwiY3dkIiwicmVhZFN0b3JhZ2UiLCJleGlzdHNTeW5jIiwiZGF0YSIsInJlYWRGaWxlU3luYyIsIkpTT04iLCJwYXJzZSIsImVycm9yIiwiY29uc29sZSIsIkdFVCIsImxvZyIsIm11c2ljRGF0YSIsImxlbmd0aCIsImpzb24iLCJzdWNjZXNzIiwibXVzaWMiLCJzdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/get-music/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fget-music%2Froute&page=%2Fapi%2Fget-music%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fget-music%2Froute.ts&appDir=C%3A%5CUsers%5Cadwai%5Cstory-w3%5Capp&pageExtensions=ts&pageExtensions=tsx&pageExtensions=js&pageExtensions=jsx&rootDir=C%3A%5CUsers%5Cadwai%5Cstory-w3&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fget-music%2Froute&page=%2Fapi%2Fget-music%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fget-music%2Froute.ts&appDir=C%3A%5CUsers%5Cadwai%5Cstory-w3%5Capp&pageExtensions=ts&pageExtensions=tsx&pageExtensions=js&pageExtensions=jsx&rootDir=C%3A%5CUsers%5Cadwai%5Cstory-w3&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_adwai_story_w3_app_api_get_music_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/get-music/route.ts */ \"(rsc)/./app/api/get-music/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/get-music/route\",\n        pathname: \"/api/get-music\",\n        filename: \"route\",\n        bundlePath: \"app/api/get-music/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\adwai\\\\story-w3\\\\app\\\\api\\\\get-music\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_adwai_story_w3_app_api_get_music_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZnZXQtbXVzaWMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmdldC1tdXNpYyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmdldC1tdXNpYyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhZHdhaSU1Q3N0b3J5LXczJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz1qcyZwYWdlRXh0ZW5zaW9ucz1qc3gmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNhZHdhaSU1Q3N0b3J5LXczJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNTO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxhZHdhaVxcXFxzdG9yeS13M1xcXFxhcHBcXFxcYXBpXFxcXGdldC1tdXNpY1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvZ2V0LW11c2ljL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZ2V0LW11c2ljXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9nZXQtbXVzaWMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxhZHdhaVxcXFxzdG9yeS13M1xcXFxhcHBcXFxcYXBpXFxcXGdldC1tdXNpY1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fget-music%2Froute&page=%2Fapi%2Fget-music%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fget-music%2Froute.ts&appDir=C%3A%5CUsers%5Cadwai%5Cstory-w3%5Capp&pageExtensions=ts&pageExtensions=tsx&pageExtensions=js&pageExtensions=jsx&rootDir=C%3A%5CUsers%5Cadwai%5Cstory-w3&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fget-music%2Froute&page=%2Fapi%2Fget-music%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fget-music%2Froute.ts&appDir=C%3A%5CUsers%5Cadwai%5Cstory-w3%5Capp&pageExtensions=ts&pageExtensions=tsx&pageExtensions=js&pageExtensions=jsx&rootDir=C%3A%5CUsers%5Cadwai%5Cstory-w3&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();