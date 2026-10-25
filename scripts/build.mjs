import {copyFile,writeFile} from 'node:fs/promises';
import {demoItems} from '../src/demo.mjs';
for(const file of ['core.mjs','demo.mjs']) await copyFile(new URL('../src/'+file,import.meta.url),new URL('../dist/'+file,import.meta.url));
await writeFile(new URL('../dist/demo-catalog.json',import.meta.url),JSON.stringify({type:'FeatureCollection',features:demoItems},null,2)+'\n');
for(const file of ['index.html','style.css','app.mjs','core.mjs','demo.mjs','demo-catalog.json']) await copyFile(new URL('../dist/'+file,import.meta.url),new URL('../docs/'+file,import.meta.url));
await writeFile(new URL('../docs/.nojekyll',import.meta.url),'');
console.log('Built static workbench in dist/ and docs/ (GitHub Pages)');
