import {copyFile,writeFile} from 'node:fs/promises';
import {demoItems} from '../src/demo.mjs';
for(const file of ['core.mjs','demo.mjs']) await copyFile(new URL('../src/'+file,import.meta.url),new URL('../dist/'+file,import.meta.url));
await writeFile(new URL('../dist/demo-catalog.json',import.meta.url),JSON.stringify({type:'FeatureCollection',features:demoItems},null,2)+'\n');
console.log('Built static workbench in dist/');
