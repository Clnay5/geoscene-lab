import {bboxGeometry} from './core.mjs';
// Synthetic fixtures, explicitly NOT observations from Sentinel or Landsat.
const specs=[
 ['DEMO-001',[113.8,29.7,115.0,30.9],5,'2026-09-14T03:10:00Z'],
 ['DEMO-002',[114.0,30.1,114.8,30.8],12,'2026-09-19T03:10:00Z'],
 ['DEMO-003',[113.8,29.7,115.0,30.9],67,'2026-09-24T03:10:00Z'],
 ['DEMO-004',[114.4,30.3,115.4,31.3],2,'2026-09-29T03:10:00Z'],
 ['DEMO-005',[113.8,29.7,115.0,30.9],null,'2026-09-09T03:10:00Z'],
 ['DEMO-006',[116.0,31.0,117.0,32.0],4,'2026-09-14T03:10:00Z'],
 ['DEMO-007',[113.8,29.7,115.0,30.9],8,'2026-08-14T03:10:00Z'],
 ['DEMO-008',[114.15,30.15,114.7,30.75],18,'2026-09-04T03:10:00Z']
];
export const demoItems=specs.map(([id,bbox,cloud,date])=>({type:'Feature',stac_version:'1.0.0',id,collection:'geoscene-synthetic',bbox,geometry:bboxGeometry(bbox),properties:{datetime:date,'eo:cloud_cover':cloud,license:'CC0-1.0','geoscene:synthetic':true},links:[],assets:{metadata:{href:`urn:geoscene:synthetic:${id}`,type:'application/json'}}}));
export const defaultOptions={aoi:[114.1,30.1,114.7,30.7],from:'2026-09-01T00:00:00Z',to:'2026-09-30T23:59:59Z',maxCloud:30};
