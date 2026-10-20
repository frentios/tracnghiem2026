(() => {
const D=DATA; const disclaimer='Công cụ tham khảo giáo dục, không phải bài đánh giá MBTI® chính thức; không chẩn đoán tâm lý và không xác định nghề phù hợp tuyệt đối.';
let storageOK=true;try{localStorage.setItem('discovery-check','1');localStorage.removeItem('discovery-check')}catch{storageOK=false}
const memory={};
function read(k,fallback){try{return JSON.parse(localStorage.getItem(k))??memory[k]??fallback}catch{return memory[k]??fallback}}
function save(k,v){memory[k]=v;try{localStorage.setItem(k,JSON.stringify(v));return true}catch{storageOK=false;return false}}
function score(answers){if(!Array.isArray(answers)||answers.length!==40||answers.some((a,i)=>!Number.isInteger(a)||!D.questions[i].options[a]))throw Error('Cần trả lời đủ 40 câu hợp lệ.');const points=Object.fromEntries('EISNTFJP'.split('').map(c=>[c,0]));answers.forEach((a,i)=>points[D.questions[i].options[a].trait]++);const letters=D.pairs.map(p=>points[p[0]]===points[p[1]]?'?':points[p[0]]>points[p[1]]?p[0]:p[1]);let possible=[''];letters.forEach((c,i)=>possible=possible.flatMap(s=>(c==='?'?D.pairs[i].split(''):[c]).map(v=>s+v)));const frequency={};possible.forEach(c=>D.profiles[c].careers.forEach(id=>frequency[id]=(frequency[id]||0)+1));const careers=Object.keys(frequency).sort((a,b)=>frequency[b]-frequency[a]||Number(a)-Number(b)).slice(0,5);return {points,code:letters.join(''),possible,careers};}
function normalize(r){if(!r||typeof r!=='object'||typeof r.id!=='string'||!/^[0-9a-f-]{36}$/i.test(r.id)||!Number.isFinite(Date.parse(r.createdAt)))throw Error('Bản ghi không hợp lệ.');const student={};for(const k of ['studentId','name','className']){if(typeof r.student?.[k]!=='string'||r.student[k].length>120)throw Error('Thông tin học sinh không hợp lệ.');student[k]=r.student[k]}return {id:r.id,createdAt:r.createdAt,student,answers:r.answers,...score(r.answers)}}
const remote=!!(CONFIG.supabaseUrl&&CONFIG.supabaseAnonKey);let client=null;
function db(){if(!remote)return null;if(!window.supabase)throw Error('Không tải được thư viện Supabase.');return client??=supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseAnonKey)}
function records(){return read('discovery-results',[])}
function store(r){const all=records();const index=all.findIndex(x=>x.id===r.id);if(index<0)all.push(r);else all[index]=r;return save('discovery-results',all)}
async function submit(r){if(!remote)return {local:store(r)};store(r);let timer;try{const response=await Promise.race([db().rpc('submit_result',{p:{id:r.id,student:r.student,answers:r.answers,recommendations:r.careers}}),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('Quá thời gian gửi (15 giây).')),15000))]);if(response.error)throw response.error;return {server:true}}finally{clearTimeout(timer)}}
const safeCell=v=>{let s=String(v??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
function csv(rows){return '\ufeff'+rows.map(row=>row.map(safeCell).join(',')).join('\r\n')}
function download(name,body,type='text/plain'){const u=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
window.Core={disclaimer,read,save,score,normalize,remote,db,records,store,submit,csv,download,el,get storageOK(){return storageOK}};
})();
