/* No student identity, answers or scores are sent to the public jobs API. */
(() => {
const E=CareerEngine,C=Core;let pending=null,pendingKey=null,sequence=0;
const settings=()=>CONFIG.market||{};
function endpoint(){const mode=settings().mode||'auto';return mode==='direct'?null:(settings().apiUrl||'api/careers')}
function availability(){
 const mode=settings().mode||'auto';
 if(mode==='disabled'||location.protocol==='file:')return {available:false,reason:'static-host'};
 const url=endpoint();
 if(url&&location.hostname.endsWith('.github.io')&&new URL(url,location.href).origin===location.origin)return {available:false,reason:'static-host'};
 return {available:true};
}
function unavailable(message){const err=Error(message);err.code='BACKEND_UNAVAILABLE';return err;}
async function fetchJSON(url,signal,answers){
 const r=await fetch(url,{signal,...(answers?{method:'POST',body:JSON.stringify({answers})}:{}),cache:'no-store',headers:{Accept:'application/json',...(answers?{'Content-Type':'application/json'}:{})},credentials:'omit',referrerPolicy:'no-referrer'});
 const isJSON=(r.headers.get('content-type')||'').includes('application/json');
 if(!r.ok){let body;if(isJSON)try{body=await r.json()}catch{}
  if([404,405].includes(r.status)||body?.code==='BACKEND_NOT_CONFIGURED')throw unavailable('Đề xuất nghề từ dữ liệu tuyển dụng chưa được kích hoạt trên website này.');
  throw Error(body?.error||'API trả mã '+r.status);
 }
 if(!isJSON)throw unavailable('Đề xuất nghề từ dữ liệu tuyển dụng chưa được kích hoạt trên website này.');
 return r.json();
}
async function direct(signal){const jobs=[];let pages=0;for(let page=1;page<=5;page++){const body=await fetchJSON('https://www.arbeitnow.com/api/job-board-api?page='+page,signal);if(!Array.isArray(body.data))throw Error('Cấu trúc nguồn đã thay đổi.');jobs.push(...body.data);pages++;if(!body.links?.next||!body.data.length)break;}return E.aggregate(jobs,{pages,provider:'arbeitnow'})}
async function refresh(answers){const key=JSON.stringify(answers||[]);if(pending&&pendingKey===key)return pending;pendingKey=key;const requestId=++sequence;pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{if(!availability().available)throw unavailable('Đề xuất nghề từ dữ liệu tuyển dụng chưa được kích hoạt trên website này.');const url=endpoint();if(!url&&(settings().provider||'jooble')!=='arbeitnow')throw Error('Nguồn Việt Nam cần backend và JOOBLE_API_KEY. GitHub Pages không chạy backend.');const response=url?await fetchJSON(answers?(settings().recommendUrl||'api/recommend'):url,controller.signal,answers):await direct(controller.signal);const snapshot=answers&&url?response.snapshot:response;if(!E.validateSnapshot(snapshot)||snapshot.provider!==(settings().provider||'jooble'))throw Error('Dữ liệu nghề không hợp lệ.');let recommendations=null;if(answers&&url){const scored=C.score(answers);if(response.code!==scored.code||Object.keys(scored.points).some(k=>response.points?.[k]!==scored.points[k]))throw Error('Điểm API không khớp đáp án.');recommendations=E.rank(scored.points,snapshot);if(!Array.isArray(response.recommendations)||response.recommendations.map(c=>c.id).join('|')!==recommendations.map(c=>c.id).join('|'))throw Error('Kết quả xếp hạng API không hợp lệ.');}C.save('laban-market-cache',{snapshot,cachedAt:new Date().toISOString()});return {snapshot,recommendations,state:'live',saved:C.storageOK,requestedAt:new Date().toISOString()}}catch(err){const cached=C.read('laban-market-cache',null);if(E.validateSnapshot(cached?.snapshot)&&cached.snapshot.provider===(settings().provider||'jooble'))return {snapshot:cached.snapshot,state:'cached',unavailable:err.code==='BACKEND_UNAVAILABLE',error:err.name==='AbortError'?'Quá thời gian tải 15 giây.':err.message};const failure=Error('Không tải được dữ liệu nghề mới: '+(err.name==='AbortError'?'quá 15 giây.':err.message));failure.code=err.code;throw failure}finally{clearTimeout(timer);if(requestId===sequence)pending=null}})();return pending}
function pack(points,market){return {version:E.VERSION,state:market.state,provider:market.snapshot.provider,source:market.snapshot.source,sourceUrl:market.snapshot.sourceUrl,scope:market.snapshot.scope,fetchedAt:market.snapshot.fetchedAt,checkedAt:new Date().toISOString(),catalog:market.snapshot.careers,sampleSize:market.snapshot.sampleSize,careerCount:market.snapshot.careers.length,recommendations:market.recommendations||E.rank(points,market.snapshot)}}
window.Market={refresh,pack,availability};
})();
