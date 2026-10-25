# Provenance and scope

本项目由 Clnay5 使用 AI 辅助开发。没有移植上游代码，原创贡献范围是本仓库的 bbox 空间计算、基础质量规则、评分解释、CLI、静态工作台和测试。AI 辅助不代替维护者对结果的复核。

参考项目：

- [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)：空间数据可视化与交互呈现的设计参考。查阅时源码为 MIT，但数据、模型、README 媒体各有许可。本项目未复制这些材料。
- [radiantearth/stac-spec](https://github.com/radiantearth/stac-spec)：Item、bbox、datetime、assets 等字段的规范参考。本项目不是完整规范验证器。
- [developmentseed/eoAPI](https://github.com/developmentseed/eoAPI)：将目录检索与栅格服务分离的架构参考；本版只实现元数据选型。

本项目中 `src/demo.mjs` 以及由其生成的 `dist/demo-catalog.json` 是 AI 辅助生成的合成测试数据，以 CC0 1.0 提供。不代表真实卫星观测，不使用真实遥感影像或地图数据。导入的用户数据不因此改变其原始许可。

代码与界面为 MIT；参考项目的名称与商标归各自所有者，参考不表示认可或合作。
