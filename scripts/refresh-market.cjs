const fs=require('node:fs/promises');
const Engine=require('../career-engine.js');
const {collect}=require('./jooble-source.cjs');
async function refresh({file='data/market.json',collectData=collect,hasKey=!!process.env.JOOBLE_API_KEY}={}){
 let previous=null;try{const saved=JSON.parse(await fs.readFile(file,'utf8'));if(Engine.validateSnapshot(saved)&&saved.provider==='jooble')previous=saved}catch{}
 if(hasKey){try{const snapshot=await collectData();if(!Engine.validateSnapshot(snapshot)||snapshot.provider!=='jooble')throw Error('Invalid snapshot');await fs.writeFile(file,JSON.stringify(snapshot,null,2)+'\n');console.log('Updated public Vietnam career snapshot: '+snapshot.careers.length+' titles.');return {state:'updated',snapshot}}catch{console.log('::warning::Career source unavailable; keeping a verified previous snapshot if available.')}}
 else console.log('::notice::JOOBLE_API_KEY is not configured; local career recommendations remain available.');
 if(previous)return {state:'preserved',snapshot:previous};
 const placeholder={status:'not_configured',provider:'jooble',careers:[]};await fs.writeFile(file,JSON.stringify(placeholder,null,2)+'\n');return {state:'unavailable'};
}
if(require.main===module)refresh().catch(()=>{console.error('Cannot prepare public career data.');process.exitCode=1});
module.exports={refresh};
