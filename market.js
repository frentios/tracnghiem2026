/* GitHub Pages: GET a public JSON snapshot. Answers and identity stay in the browser. */
(() => {
const E=CareerEngine,C=Core;let pending=null;
function availability(){return {available:true}}
function unavailable(){const err=Error('Dữ liệu tuyển dụng chưa được cập nhật cho website này.');err.code='DATA_UNAVAILABLE';return err}
async function refresh(){if(pending)return pending;pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{
 const url=new URL(CONFIG.market?.dataUrl||'data/market.json',location.href);if(url.origin!==location.origin)throw Error('Chỉ tải bản dữ liệu cùng website.');
 const response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',headers:{Accept:'application/json'}});
 if([404,405].includes(response.status))throw unavailable();if(!response.ok)throw Error('Không tải được bản dữ liệu tuyển dụng.');
 if(!(response.headers.get('content-type')||'').includes('application/json'))throw unavailable();
 const snapshot=await response.json();if(snapshot.status==='not_configured')throw unavailable();
 if(!E.validateSnapshot(snapshot)||snapshot.provider!=='jooble')throw Error('Bản dữ liệu nghề không hợp lệ.');
 C.save('laban-market-cache',{snapshot,cachedAt:new Date().toISOString()});return {snapshot,state:'snapshot',saved:C.storageOK,requestedAt:new Date().toISOString()};
 }catch(err){const cached=C.read('laban-market-cache',null);if(E.validateSnapshot(cached?.snapshot)&&cached.snapshot.provider==='jooble')return {snapshot:cached.snapshot,state:'cached',unavailable:err.code==='DATA_UNAVAILABLE',error:err.name==='AbortError'?'Quá thời gian tải.':err.message};const failure=Error(err.name==='AbortError'?'Quá thời gian tải dữ liệu nghề.':err.message);failure.code=err.code;throw failure;
 }finally{clearTimeout(timer);pending=null}})();return pending}
function pack(points,market){return {version:E.VERSION,state:market.state,provider:market.snapshot.provider,source:market.snapshot.source,sourceUrl:market.snapshot.sourceUrl,scope:market.snapshot.scope,fetchedAt:market.snapshot.fetchedAt,checkedAt:new Date().toISOString(),catalog:market.snapshot.careers,sampleSize:market.snapshot.sampleSize,careerCount:market.snapshot.careers.length,recommendations:E.rank(points,market.snapshot)}}
window.Market={refresh,pack,availability};
})();
