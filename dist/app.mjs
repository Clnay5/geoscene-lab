import {selectScenes,toGeoJSON,splitBBox,validateBBox} from './core.mjs';
import {demoItems,defaultOptions} from './demo.mjs';
const $=id=>document.getElementById(id);
let items=structuredClone(demoItems),report,options,selected=0,synthetic=true;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reasons={OUTSIDE_AOI:'不与研究区相交',OUTSIDE_TIME:'不在日期范围',TOO_CLOUDY:'云量超过阈值',CLOUD_UNKNOWN:'云量未知',DUPLICATE:'重复 ID',BBOX:'范围无效',TIME:'时间无效',CLOUD_RANGE:'云量数值无效',TYPE:'类型无效',ID:'缺少 ID'};
function readOptions(){const aoi=$('bbox').value.split(',').map(Number);validateBBox(aoi);return {aoi,from:$('from').value+'T00:00:00Z',to:$('to').value+'T23:59:59.999Z',maxCloud:Number($('cloud').value),includeUnknownCloud:$('unknown').checked};}
function renderMap(){
 const boxes=[...splitBBox(options.aoi),...report.accepted.flatMap(r=>splitBBox(r.item.bbox))];
 let minX=Math.min(...boxes.map(b=>b[0])),maxX=Math.max(...boxes.map(b=>b[2])),minY=Math.min(...boxes.map(b=>b[1])),maxY=Math.max(...boxes.map(b=>b[3]));
 const padX=Math.max((maxX-minX)*.2,.05),padY=Math.max((maxY-minY)*.2,.05);minX-=padX;maxX+=padX;minY-=padY;maxY+=padY;
 const x=n=>40+(n-minX)/(maxX-minX)*820,y=n=>355-(n-minY)/(maxY-minY)*320;
 let svg='<defs><pattern id="grid" width="36" height="30" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 30" fill="none" stroke="#26383d" stroke-width=".6"/></pattern></defs><rect width="900" height="390" fill="url(#grid)"/>';
 for(let i=0;i<5;i++){let lon=minX+(maxX-minX)*i/4,lat=minY+(maxY-minY)*i/4;svg+=`<text x="${x(lon)}" y="378" fill="#738b8d" font-size="10" text-anchor="middle">${lon.toFixed(2)}°</text><text x="6" y="${y(lat)}" fill="#738b8d" font-size="10">${lat.toFixed(2)}°</text>`;}
 function rect(box,stroke,fill,dash=''){const [w,s,e,n]=box;return `<rect x="${x(w)}" y="${y(n)}" width="${x(e)-x(w)}" height="${y(s)-y(n)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash?'stroke-dasharray="6 5"':''}/>`;}
 report.accepted.forEach((r,i)=>{for(const b of splitBBox(r.item.bbox)){svg+=rect(b,i===selected?'#d6e8b0':'#69a5c5',i===selected?'#b7edb720':'#69a5c510');svg+=`<text x="${x(b[0])+7}" y="${y(b[3])+16}" font-size="11" fill="#91b7c8">${escape(r.item.id)}</text>`;}});
 for(const b of splitBBox(options.aoi))svg+=rect(b,'#b7edb7','#b7edb718',true);
 svg+='<text x="850" y="30" fill="#b7edb7" font-size="11">N ↑</text>';
 $('map').innerHTML=svg;$('map-extent').textContent=options.aoi.map(n=>n.toFixed(2)).join(' / ');
}
function renderDetail(){const r=report.accepted[selected];if(!r){$('detail').textContent='当前没有满足筛选条件的影像，请调整条件。';return;}
 const rows=[['空间覆盖',r.components.coverage,60],['清晰度',r.components.clarity,30],['元数据',r.components.metadata,10]];
 $('detail').innerHTML=`<h3>${escape(r.item.id)} · 评分依据</h3>${rows.map(([label,value,max])=>`<div class="score-row"><span>${label}</span><span class="bar"><i style="width:${value/max*100}%"></i></span><b>${value.toFixed(1)} / ${max}</b></div>`).join('')}<p>研究区包围盒覆盖率 ${(r.coverage*100).toFixed(1)}%<br>采集时间 ${escape(r.item.properties.datetime??'起止时间区间')}<br>云量 ${r.item.properties['eo:cloud_cover']??'未知'}${r.item.properties['eo:cloud_cover']!=null?'%':''}</p>${r.issues.length?r.issues.map(i=>`<p>△ ${escape(i.message)}</p>`).join(''):'<p class="ok">✓ 基础元数据规则未发现问题</p>'}<p>本评分为元数据启发式排序，不代表影像实际像元质量。</p>`;
}
function run(){try {options=readOptions();report=selectScenes(items,options);selected=0;$('error').textContent='';$('total').textContent=report.summary.input;$('matched').textContent=report.summary.accepted;$('best').textContent=report.accepted[0]?.score.toFixed(1)??'—';$('warnings').textContent=report.accepted.reduce((n,r)=>n+r.issues.length,0);
 $('scene-list').innerHTML=report.accepted.length?report.accepted.map((r,i)=>`<button class="scene ${i===0?'active':''}" data-index="${i}"><span><strong>${escape(r.item.id)}</strong><small>覆盖 ${(r.coverage*100).toFixed(0)}% · 云量 ${r.item.properties['eo:cloud_cover']??'未知'}${r.item.properties['eo:cloud_cover']!=null?'%':''}</small></span><b>${r.score.toFixed(1)}</b></button>`).join(''):'<p class="empty">暂无匹配影像</p>';
 $('rejected-title').textContent=`查看 ${report.rejected.length} 景排除原因`;$('rejected-list').innerHTML=report.rejected.map(r=>`<p>${escape(r.id)} — ${r.reasons.map(c=>escape(reasons[c]??c)).join(' / ')}</p>`).join('');renderMap();renderDetail();}catch(e){$('error').textContent=e.message;report=null;}}
function download(name,data){if(!report){$('error').textContent='请先完成有效筛选';return;}const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function restore(){items=structuredClone(demoItems);synthetic=true;$('data-note').textContent='当前为 8 景合成演示数据，无真实影像像元。';$('bbox').value=defaultOptions.aoi.join(',');$('from').value='2026-09-01';$('to').value='2026-09-30';$('cloud').value='30';$('cloud-value').textContent='30%';$('unknown').checked=false;$('preset').value='wuhan';$('upload').value='';run();}
$('run').addEventListener('click',run);$('reset').addEventListener('click',restore);$('cloud').addEventListener('input',()=>{$('cloud-value').textContent=$('cloud').value+'%';});
$('real').addEventListener('click',async()=>{try{const response=await fetch('./earth-search-sample.json');if(!response.ok)throw new Error('真实样例暂时无法载入');const data=await response.json();items=data.features;synthetic=false;$('bbox').value=defaultOptions.aoi.join(',');$('from').value='2025-09-01';$('to').value='2025-09-30';$('cloud').value='30';$('cloud-value').textContent='30%';$('unknown').checked=false;$('preset').value='wuhan';$('data-note').textContent='真实元数据快照：Earth Search / Sentinel-2 L2A，2025年9月武汉研究区；60条返回记录中选取云量最低10景。未下载像元；数据许可按 ESA Sentinel Data Legal Notice。';run();}catch(error){$('error').textContent=error.message;}});
$('scene-list').addEventListener('click',e=>{const button=e.target.closest('[data-index]');if(!button)return;selected=Number(button.dataset.index);document.querySelectorAll('.scene').forEach((b,i)=>b.classList.toggle('active',i===selected));renderMap();renderDetail();});
$('export').addEventListener('click',()=>download('geoscene-candidates.geojson',report?toGeoJSON(report):null));$('report').addEventListener('click',()=>download('geoscene-audit.json',report?{project:'GeoScene Lab',synthetic,options,...report}:null));
$('bbox').addEventListener('input',()=>{$('preset').value='custom';});
$('preset').addEventListener('change',()=>{if($('preset').value==='wuhan')$('bbox').value=defaultOptions.aoi.join(',');if($('preset').value==='dateline')$('bbox').value='179,-10,-179,10';run();});
$('upload').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>10*1024*1024)throw new Error('文件不能超过 10 MB');const data=JSON.parse(await file.text());const list=Array.isArray(data)?data:data.type==='FeatureCollection'?data.features:data.type==='Feature'?[data]:null;if(!Array.isArray(list)||!list.length)throw new Error('请输入非空 STAC Item、Item 数组或 FeatureCollection');if(list.length>20000)throw new Error('单次最多导入 20,000 景');items=list;synthetic=false;$('data-note').textContent=`已导入 ${file.name}，共 ${items.length} 景；许可与数据真实性由原始目录决定。`;run();}catch(e){$('error').textContent=e.message;}});
run();
