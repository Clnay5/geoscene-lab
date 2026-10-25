import {readFile,writeFile} from 'node:fs/promises';
import {selectScenes,toGeoJSON} from './core.mjs';
const [input,output,bbox,from,to,cloud='30']=process.argv.slice(2);
try {
  if(!input||!output||!bbox||!from||!to) throw new Error('用法: node src/cli.mjs input.json report.json west,south,east,north from-RFC3339 to-RFC3339 [maxCloud]');
  const data=JSON.parse(await readFile(input,'utf8'));
  const items=Array.isArray(data)?data:data.features;
  const result=selectScenes(items,{aoi:bbox.split(',').map(Number),from,to,maxCloud:Number(cloud)});
  await writeFile(output,JSON.stringify({...result,geojson:toGeoJSON(result)},null,2)+'\n');
  console.log(JSON.stringify(result.summary));
} catch(error) {console.error(error.message);process.exitCode=1;}
