const Engine=require('../career-engine.js');
async function collect(){
 const key=process.env.JOOBLE_API_KEY;
 if(!key){const error=Error('Chưa cấu hình JOOBLE_API_KEY trong GitHub Actions Secrets.');error.statusCode=503;throw error;}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const jobs=[];let pages=0,totalAvailable=null;const seenPages=new Set();
 for(let i=1;i<=5;i++){
  const response=await fetch('https://jooble.org/api/'+encodeURIComponent(key),{method:'POST',signal:controller.signal,headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({keywords:'',location:'Việt Nam',page:String(i)})});
  if(!response.ok){const error=Error(response.status===401||response.status===403?'Khóa Jooble không hợp lệ hoặc chưa được cấp quyền.':'Nguồn Jooble tạm không phản hồi hợp lệ.');error.statusCode=502;throw error;}
  const body=await response.json();if(!Array.isArray(body.jobs))throw Error('Nguồn Jooble đã thay đổi định dạng.');if(Number.isInteger(body.totalCount))totalAvailable=body.totalCount;
  const signature=body.jobs.map(j=>j.id||j.link).join('|');if(seenPages.has(signature))break;seenPages.add(signature);pages++;
  jobs.push(...body.jobs.map(j=>({title:j.title,url:j.link,company_name:j.company,location:j.location,created_at:Date.parse(j.updated)/1000,tags:[]})));
  if(body.jobs.length===0)break;
 }
 return Engine.aggregate(jobs,{pages,provider:'jooble',totalAvailable});
 }finally{clearTimeout(timer)}
}
module.exports={collect};
