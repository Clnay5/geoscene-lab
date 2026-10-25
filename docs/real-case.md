# 真实 STAC 目录验收：武汉研究区

数据服务：[Element 84 Earth Search](https://earth-search.aws.element84.com/v1)，Collection：`sentinel-2-l2a`。

研究区：`[114.1,30.1,114.7,30.7]`；时间：2025-09-01 至 2025-09-30 UTC。2026-10-25 查询，`limit=100`，目录匹配并返回 60 景。从该页中按景级云量升序保留前 10 景。**这是有意选择的低云量验收子集，不是随机样本或完整目录。**

查询 URL、实际时间、上游许可字段见 [real-sample-source.json](real-sample-source.json)。精简后的 [样本 JSON](earth-search-sample.json) 保留原始 ID、bbox、geometry、日期、云量、platform、来源链接和 red／NIR 资产信息；没有下载像元，也没有检验资产可访问性。

样本文件 SHA256：`75DAEE3BF87B7DD05F1D72055162C51969C204A347CE098B9C86450D59600E62`。

```bash
node src/cli.mjs dist/earth-search-sample.json docs/real-case-report.json 114.1,30.1,114.7,30.7 2025-09-01T00:00:00Z 2025-09-30T23:59:59Z 30
```

浏览器点击“载入真实 Sentinel-2 样例”会读取本站静态 JSON，并将时间切换到 2025 年 9 月。该快照包含 10 景，其中 6 景满足云量 ≤30% 及空间、时间条件；其余 4 景超过云量阈值。报告见 [real-case-report.json](real-case-report.json)。

请注意：一景的云量是全景统计，不能说明武汉研究区内的实际云覆盖。排序使用 bbox 近似，没有使用真实 geometry 精确求交或云掩膜。下一步需要在 QGIS 核对边界并验证像元层面的可用性。
