import {performance} from 'node:perf_hooks';
import {cpus,platform,arch} from 'node:os';
import {writeFile} from 'node:fs/promises';
import {selectScenes} from '../src/core.mjs';
import {demoItems,defaultOptions} from '../src/demo.mjs';
const items=Array.from({length:10000},(_,i)=>({...demoItems[i%8],id:`BENCH-${String(i).padStart(5,'0')}`}));
selectScenes(items,defaultOptions);
const times=[];let report;
for(let i=0;i<7;i++){const start=performance.now();report=selectScenes(items,defaultOptions);times.push(performance.now()-start);}
const result={fixture:'10,000 synthetic metadata Items; no network or pixels',node:process.version,platform:platform(),arch:arch(),cpu:cpus()[0]?.model,runs:7,milliseconds:times.map(n=>Number(n.toFixed(3))),median_ms:Number([...times].sort((a,b)=>a-b)[3].toFixed(3)),summary:report.summary,scope:'Core metadata filtering, audit and ranking only. Not remote STAC latency, raster processing or browser rendering.'};
await writeFile('docs/benchmark.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
