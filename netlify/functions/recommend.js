const Data=require('../../data.js');
const Engine=require('../../career-engine.js');
const {handler:market}=require('./careers.js');
function score(answers){
 if(!Array.isArray(answers)||answers.length!==40||answers.some((a,i)=>!Number.isInteger(a)||!Data.questions[i].options[a]))throw Error('Cần đúng 40 đáp án hợp lệ.');
 const points=Object.fromEntries('EISNTFJP'.split('').map(c=>[c,0]));answers.forEach((a,i)=>points[Data.questions[i].options[a].trait]++);
 const code=Data.pairs.map(p=>points[p[0]]===points[p[1]]?'?':points[p[0]]>points[p[1]]?p[0]:p[1]).join('');return {points,code};
}
exports.handler=async(event)=>{
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 if(event.httpMethod!=='POST')return {statusCode:405,headers:{...headers,Allow:'POST'},body:JSON.stringify({error:'Method not allowed'})};
 try{
  // Do not log/store bodies. Only answers are needed; identities are rejected.
  if(event.isBase64Encoded||typeof event.body!=='string'||Buffer.byteLength(event.body)>2048)throw Error('Payload không hợp lệ.');
  const body=JSON.parse(event.body);if(!body||typeof body!=='object'||Object.keys(body).some(k=>k!=='answers'))throw Error('Chỉ gửi 40 đáp án, không gửi định danh.');
  const result=score(body.answers);let response;
  try {
   // Use the shared CDN catalog in production; never cache personalized POSTs.
   const base=process.env.NETLIFY==='true'&&!process.env.NETLIFY_DEV?(process.env.DEPLOY_PRIME_URL||process.env.URL):null;
   if(base){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),13000);try{const source=await fetch(new URL('/api/careers',base),{signal:controller.signal,headers:{Accept:'application/json'}});response={statusCode:source.status,body:await source.text()};}finally{clearTimeout(timer)}}
   else response=await market({httpMethod:'GET'});
  }catch{return {statusCode:502,headers,body:JSON.stringify({error:'Không tải được catalog nghề Việt Nam; hãy thử lại.'})};}
  if(response.statusCode!==200)return {...response,headers};
  const snapshot=JSON.parse(response.body);return {statusCode:200,headers,body:JSON.stringify({...result,snapshot,recommendations:Engine.rank(result.points,snapshot)})};
 }catch{return {statusCode:400,headers,body:JSON.stringify({error:'Dữ liệu không hợp lệ: API chỉ nhận 40 đáp án 0/1, không nhận thông tin định danh.'})}}
};
