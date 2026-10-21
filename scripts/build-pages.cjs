const fs=require('node:fs/promises');const path=require('node:path');
const publicFiles=['index.html','admin.html','teacher-login.html','style.css','admin.css','app.js','admin.js','teacher-login.js','teacher-auth.js','config.js','data.js','core.js','career-engine.js','market.js','market-view.js','vendor','data/market.json','.nojekyll'];
async function build(dest='_site'){await fs.mkdir(dest,{recursive:true});for(const name of publicFiles){const target=path.join(dest,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.cp(name,target,{recursive:true});}return publicFiles;}
if(require.main===module)build().catch(e=>{console.error(e.message);process.exitCode=1});module.exports={build};
