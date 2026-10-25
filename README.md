# GeoScene Lab

**遥感影像选型与 STAC 元数据质量审计工作台**

[在线演示](https://clnay5.github.io/geoscene-lab/) · [个人主页](https://github.com/Clnay5) · [核心测试](https://github.com/Clnay5/geoscene-lab/actions)

面向“为研究区挑选一景可用影像”的具体任务：导入 STAC 元数据，按空间范围、时间和云量筛选，解释评分依据，再导出候选影像范围与审计记录。

由 Clnay5 在 AI 辅助下开发的 GIS 工程实验项目。设计灵感来自 [God’s Eye View](https://github.com/bilawalsidhu/gods-eye-view) 的空间数据可视化思路与 [STAC](https://stacspec.org/) 生态；本仓库独立实现，未复制上游代码、截图、模型或数据。不是上游的官方分支。

## 运行

Node.js 22 或更高版本，无需安装第三方依赖。

```bash
npm run build
npm start
```

打开终端显示的本机地址。也可将 `dist/` 作为静态网站部署；ES Modules 需要 HTTP 服务，不建议直接双击 HTML。

## 可以做什么

- 在浏览器本地导入 STAC Item、Item 数组或 ItemCollection，文件不会上传。
- 一键载入真实 Sentinel-2 目录元数据快照；保留查询、采集时间和 SHA256，见 [真实案例](docs/real-case.md)。
- 用二维 WGS84 bbox、起止日期和云量阈值筛选；支持跨 ±180° 经线的范围。
- 按覆盖率、清晰度、元数据完整度排序，并查看每项得分。
- 查看无效日期、异常云量、缺失资产、未知许可、重复 ID 等问题与排除原因。
- 导出可导入 QGIS 的 GeoJSON 包围盒范围，以及含筛选参数的 JSON 报告。
- 使用同一核心模块在命令行批处理。

```bash
node src/cli.mjs dist/demo-catalog.json docs/demo-report.json 114.1,30.1,114.7,30.7 2026-09-01T00:00:00Z 2026-09-30T23:59:59Z 30
npm test
npm run benchmark
```

## 方法

球面矩形面积：`R² × Δλ × (sin φ北 − sin φ南)`，`R = 6371008.8 m`。先拆分跨日期变更线的 bbox，再累计相交矩形面积。

`总分 = 60 × 研究区覆盖率 + 30 × (1 − 云量/100) + 10 × 元数据质量系数`

元数据质量系数为 `max(0, 1 − warning数量/5)`。权重是显式的启发式规则，没有用标注数据训练。云量未知时默认排除；选择包含时，清晰度得分为 0。重复键为 `(collection, id)`。

## 已验证的工程成果

核心模块通过 **28 项 Node 内置测试**，涵盖球面面积、日期变更线、未知云量、时间区间、去重与 GeoJSON 导出。

本机对 **10,000 条合成 STAC 元数据**进行了 7 次计时，中位数 **93.699 ms**；环境为 Node v24.22.1、Windows x64、AMD Ryzen 9 7945HX。原始记录见 [benchmark.json](docs/benchmark.json)，可运行命令复测。该指标仅包含元数据审计、筛选与排序，不包含网络、影像下载、像元计算或浏览器渲染，也未与其他项目进行性能对比。

## 数据与边界

- 默认 8 景数据为 **CC0 合成测试数据**，不是实际 Sentinel／Landsat 观测；不提供遥感图像像元。
- 地图为等距圆柱投影的坐标示意，不是实际地理底图，不含地名或地物。
- 覆盖率和导出 geometry 都基于 bbox 近似；不是实际影像轮廓／有效像元覆盖率。
- 云量来自目录元数据，通常不是研究区内部的云量。
- 当前为基础质量规则审计，不是完整 STAC JSON Schema 验证器；只支持二维 bbox，不支持高度坐标。
- 内置真实元数据样例为静态快照；不包含运行时在线 STAC 查询、分页抓取、COG 瓦片、NDVI、变化检测或生产级大数据索引。
- 网页导入限制为 10 MB、20,000 景。未核验导入资产是否可访问，不自动访问其链接。

## 项目结构

```text
src/core.mjs             空间计算、质量审计、排序、GeoJSON
src/demo.mjs             明确标注的合成测试目录
src/cli.mjs              批处理入口
dist/                   无依赖静态工作台与共享模块
test/core.test.mjs       28 项核心测试
docs/selection.md        热门项目调研与设计取舍
docs/interview.md        演示步骤、面试问题与简历使用边界
docs/benchmark.json      本机性能原始记录
```

## 后续方向

已加入公开 STAC 目录的静态验收快照；下一步接入在线查询、多边形精确相交、研究区像元云掩膜和 COG 渲染。暂不把规划中的能力写进已完成成果。

代码采用 [MIT](LICENSE) 许可。参考、数据与原创范围见 [ATTRIBUTION.md](ATTRIBUTION.md)。
