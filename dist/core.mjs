// GeoScene Lab: independently implemented, no upstream source code copied.
const R = 6371008.8;
const radians = n => n * Math.PI / 180;
export function validateBBox(box) {
  if (!Array.isArray(box) || box.length !== 4 || !box.every(Number.isFinite)) throw new Error('bbox 必须是四个有限数字 [west,south,east,north]');
  const [w,s,e,n] = box;
  if (Math.abs(w)>180 || Math.abs(e)>180 || Math.abs(s)>90 || Math.abs(n)>90 || s>=n || w===e) throw new Error('bbox 经度须在 ±180、纬度在 ±90 内，且面积非零');
  return box;
}
export function splitBBox(box) {
  const [w,s,e,n] = validateBBox(box);
  return w<e ? [[w,s,e,n]] : [[w,s,180,n],[-180,s,e,n]].filter(b=>b[0]<b[2]);
}
export function bboxArea(box) {
  return splitBBox(box).reduce((sum,[w,s,e,n])=>sum+R*R*radians(e-w)*(Math.sin(radians(n))-Math.sin(radians(s))),0);
}
export function coverage(scene,aoi) {
  let intersection=0;
  for (const a of splitBBox(scene)) for (const b of splitBBox(aoi)) {
    const w=Math.max(a[0],b[0]),s=Math.max(a[1],b[1]),e=Math.min(a[2],b[2]),n=Math.min(a[3],b[3]);
    if(w<e && s<n) intersection+=bboxArea([w,s,e,n]);
  }
  return Math.min(1,intersection/bboxArea(aoi));
}
export function bboxGeometry(box) {
  const coordinates=splitBBox(box).map(([w,s,e,n])=>[[[w,s],[e,s],[e,n],[w,n],[w,s]]]);
  return coordinates.length===1 ? {type:'Polygon',coordinates:coordinates[0]} : {type:'MultiPolygon',coordinates};
}
function timestamp(value) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  const day=value.slice(0,10), parsed=Date.parse(day+'T00:00:00Z');
  if(!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0,10)!==day) return NaN;
  if(Number(value.slice(11,13))>23 || Number(value.slice(14,16))>59 || Number(value.slice(17,19))>59) return NaN;
  return Date.parse(value);
}
function interval(item) {
  const p=item.properties??{};
  if(p.datetime!==null && p.datetime!==undefined) { const t=timestamp(p.datetime); return [t,t]; }
  return [timestamp(p.start_datetime),timestamp(p.end_datetime)];
}
export function auditItem(item) {
  const issues=[];
  const add=(severity,code,message)=>issues.push({severity,code,message});
  if(!item || typeof item!=='object') return [{severity:'error',code:'ITEM',message:'Item 必须是对象'}];
  if(item.type!=='Feature') add('error','TYPE','STAC Item 的 type 须为 Feature');
  if(typeof item.id!=='string'||!item.id.trim()) add('error','ID','缺少有效 id');
  if(!item.properties||typeof item.properties!=='object'||Array.isArray(item.properties)) add('error','PROPERTIES','properties 必须是对象');
  if(item.links!==undefined&&(!Array.isArray(item.links)||item.links.some(l=>!l||typeof l.rel!=='string'||typeof l.href!=='string'))) add('error','LINKS','links 必须是含 rel 和 href 字符串的对象数组');
  if(typeof item.stac_version!=='string') add('warning','VERSION','缺少 stac_version');
  try {validateBBox(item.bbox);} catch {add('error','BBOX','仅支持有效的二维 WGS84 bbox');}
  const [start,end]=interval(item);
  if(!Number.isFinite(start)||!Number.isFinite(end)||start>end) add('error','TIME','缺少有效的 RFC3339 datetime 或起止时间');
  const cloud=item.properties?.['eo:cloud_cover'];
  if(cloud===null||cloud===undefined) add('warning','CLOUD_UNKNOWN','云量未知，筛选时默认排除');
  else if(typeof cloud!=='number'||!Number.isFinite(cloud)||cloud<0||cloud>100) add('error','CLOUD_RANGE','云量须为 0–100 的数字');
  if(!item.geometry) add('warning','GEOMETRY','缺少 geometry：只能使用包围盒近似');
  if(!item.assets || !Object.values(item.assets).some(a=>a&&typeof a.href==='string'&&a.href.trim())) add('warning','ASSETS','未发现有效资产地址');
  if(!item.properties?.license && !(Array.isArray(item.links)&&item.links.some(l=>l&&(l.rel==='license'||l.rel==='collection')))) add('warning','LICENSE','请从所属 Collection 核对许可');
  return issues;
}
export function selectScenes(items,options) {
  if(!Array.isArray(items)) throw new Error('输入必须是 STAC Item 数组');
  const {aoi,maxCloud=30,includeUnknownCloud=false}=options;
  validateBBox(aoi);
  if(!Number.isFinite(maxCloud)||maxCloud<0||maxCloud>100) throw new Error('maxCloud 必须在 0–100 之间');
  const from=timestamp(options.from),to=timestamp(options.to);
  if(!Number.isFinite(from)||!Number.isFinite(to)||from>to) throw new Error('请提供有效且有序的 RFC3339 时间范围');
  const accepted=[],rejected=[],seen=new Set();
  for(const item of items) {
    const issues=auditItem(item), key=JSON.stringify([item?.collection??'',item?.id]);
    const reasons=issues.filter(i=>i.severity==='error').map(i=>i.code);
    if(seen.has(key)) reasons.push('DUPLICATE'); else seen.add(key);
    let overlap=0;
    if(!reasons.length) {
      overlap=coverage(item.bbox,aoi);
      const [start,end]=interval(item),cloud=item.properties?.['eo:cloud_cover'];
      if(overlap<=0) reasons.push('OUTSIDE_AOI');
      if(start>to||end<from) reasons.push('OUTSIDE_TIME');
      if(cloud===null||cloud===undefined) { if(!includeUnknownCloud) reasons.push('CLOUD_UNKNOWN'); }
      else if(cloud>maxCloud) reasons.push('TOO_CLOUDY');
    }
    if(reasons.length) {rejected.push({id:item?.id??'(missing)',reasons,issues});continue;}
    const cloud=item.properties?.['eo:cloud_cover'];
    // Unknown cloud gets zero clarity; absence must never look like clear sky.
    const clarity=cloud===null||cloud===undefined ? 0 : 1-cloud/100;
    const quality=Math.max(0,1-issues.filter(i=>i.severity==='warning').length/5);
    const components={coverage:overlap*60,clarity:clarity*30,metadata:quality*10};
    accepted.push({item,coverage:overlap,score:Object.values(components).reduce((a,b)=>a+b,0),components,issues});
  }
  accepted.sort((a,b)=>b.score-a.score||String(a.item.id).localeCompare(String(b.item.id),'en'));
  return {accepted,rejected,summary:{input:items.length,accepted:accepted.length,rejected:rejected.length},method:'spherical-bbox-v1; weights 60/30/10; bbox approximation, not valid-pixel coverage'};
}
export function toGeoJSON(report) {
  return {type:'FeatureCollection',features:report.accepted.map(r=>({type:'Feature',id:r.item.id,geometry:bboxGeometry(r.item.bbox),bbox:r.item.bbox,properties:{id:r.item.id,collection:r.item.collection??null,datetime:r.item.properties.datetime??null,cloud:r.item.properties['eo:cloud_cover']??null,score:r.score,bbox_coverage:r.coverage,geometry_method:'bbox footprint approximation',source:r.item.links?.find(l=>l.rel==='self')?.href??null}}))};
}
