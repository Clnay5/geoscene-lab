# 选题记录 · 2026-10-25（北京时间）

目标：地理信息科学专业的可演示工程项目，补充已有 C#／GDAL 桌面影像处理作品中的 WebGIS、空间数据互操作与工程验证能力。

## 热门项目调研

| 候选 | 查阅来源 | 适配判断 |
| --- | --- | --- |
| [God’s Eye View](https://github.com/bilawalsidhu/gods-eye-view) | GitHub 仓库当前抓取显示约 59.8k Stars；[周榜](https://github.com/trending?since=weekly) 缓存中出现，但榜单缓存时间早于查阅日 | GIS 相关度高；借鉴空间数据的可视化组织，不复用广泛的实时数据源与媒体资产 |
| [hyperframes](https://github.com/heygen-com/hyperframes) | GitHub 仓库约 71.7k Stars；Apache-2.0 | 视频开发与专业主线联系较弱，暂不选 |
| [context-mode](https://github.com/mksglu/context-mode) | GitHub 仓库约 32.1k Stars；当前 LICENSE 为 ELv2 | 有工程价值，但不如空间项目贴合专业；不搬用代码 |
| [humanlayer/skills](https://github.com/humanlayer/skills) | GitHub 仓库约 5.4k Stars；MIT | 工作流技能难以单独证明 GIS 空间分析能力，暂不选 |

数字为查阅页面的快照近似值，各缓存时点不一致，不是实时排名或当日增长。Stars 只作为关注度线索，不当作质量或原创能力证明。

## 保留的优点与本项目的取舍

保留：空间范围可视化、明确的数据来源、可交互探索与结果解释。

本项目主动缩小范围：只做 STAC 元数据影像选型；没有外部 API 密钥、实时情报层、3D 模型和大量运行时依赖。此举服务于可复现和可讲解，不表示上游功能不好。

独立增加：跨日期变更线拆分、球面矩形面积、未知云量显式处理、逐景排除原因、质量提示与评分分项、GeoJSON 与 JSON 报告、CLI 和边界测试。

这是受到开源生态启发的新实现，不是替换标题、隐藏来源的上游镜像；也没有声称达到上游的复杂度、性能或真实数据覆盖度。
