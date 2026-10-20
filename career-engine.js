/* Shared browser/server recommendation engine. Rule-based exploration, not a validated career test. */
(function(root,factory){const engine=factory();if(typeof module==='object'&&module.exports)module.exports=engine;else root.CareerEngine=engine})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const VERSION='market-rules-v2';
// Editorial group mapping and exploratory axes: + means E/S/T/J, - means I/N/F/P.
// These are transparent assumptions, not occupational psychometric measurements.
const rules=[
 ['1',/\b(software|developer|entwickler|programmier|frontend|backend|full.?stack|data scientist|data engineer|machine learning|devops|cyber|informatik|it consultant|sap|cloud engineer|qa engineer|test automation)\b/i,[-.5,-.6,.8,.1]],
 ['4',/\b(nurse|nursing|arzt|pflege|medical|physician|healthcare|therap|clinical|pharma|apotheker)\b/i,[.2,.5,-.5,.6]],
 ['5',/\b(teacher|teaching|lehrer|educator|trainer|ausbilder|education|dozent)\b/i,[.5,0,-.5,.3]],
 ['7',/\b(accountant|accounting|buchhalt|finanz|finance|financial|audit|steuer|tax|banking|controller|actuary)\b/i,[-.2,.7,.8,.8]],
 ['8',/\b(legal|lawyer|jurist|rechtsanwalt|paralegal|compliance|public administration)\b/i,[.1,.4,.7,.7]],
 ['9',/\b(marketing|content|journalis|seo|social media|communication|redakteur|copywriter|pr manager|public relations)\b/i,[.6,-.6,-.2,-.4]],
 ['10',/\b(designer|design|artist|creative|kreativ|illustrat|animation|video editor|ux|ui)\b/i,[0,-.8,-.3,-.6]],
 ['11',/\b(psycholog|social worker|sozial|counsel|research social|human resources|recruiter|recruiting|hr manager|personalreferent)\b/i,[.5,-.3,-.8,.1]],
 ['12',/\b(hotel|hospitality|tourism|travel|customer service|customer support|kundenservice|restaurant|chef|koch|rezeption|servicekraft)\b/i,[.8,.5,-.5,-.2]],
 ['13',/\b(agri|umwelt|environment|biolog|ecolog|sustainab|landwirt|renewable|nachhaltig)\b/i,[-.3,.2,.3,.1]],
 ['14',/\b(logistic|supply chain|warehouse|lager|procurement|einkauf|disponent|transport|fulfillment|spedition)\b/i,[.1,.8,.6,.8]],
 ['15',/\b(architect|architekt|civil engineer|bauingenieur|construction|bauleiter|building|bim|survey)\b/i,[-.2,.3,.6,.6]],
 ['3',/\b(scientist|researcher|research associate|wissenschaft|physic|chemist|laboratory|laborant|mathemat)\b/i,[-.7,-.5,.8,.2]],
 ['2',/\b(engineer|ingenieur|technician|techniker|mechanic|mechatron|electri|elektr|automation|maschinen|production|fertigung|quality)\b/i,[-.3,.6,.8,.5]],
 ['6',/\b(sales|vertrieb|business|manager|management|consultant|berater|operations|product owner|projektleit|teamleit|geschäft|kaufmann)\b/i,[.7,-.2,.4,.7]]
];
const viRules=[
 ['1',/lap trinh|phan mem|khoa hoc du lieu|ky su du lieu|tri tue nhan tao|an ninh mang|cong nghe thong tin/],
 ['4',/y te|bac si|dieu duong|duoc si|cham soc suc khoe|ky thuat y/],
 ['5',/giao vien|giang vien|giao duc|dao tao|su pham/],
 ['7',/ke toan|tai chinh|ngan hang|kiem toan|bao hiem|thue/],
 ['8',/luat su|phap che|phap ly|hanh chinh cong/],
 ['9',/truyen thong|bao chi|tiep thi|bien tap|noi dung|quang cao/],
 ['10',/thiet ke|do hoa|my thuat|nghe thuat|sang tao|dung phim/],
 ['11',/tam ly|xa hoi|nhan su|tuyen dung/],
 ['12',/du lich|khach san|nha hang|dau bep|cham soc khach hang|le tan/],
 ['13',/nong nghiep|sinh hoc|moi truong|thuy san|chan nuoi/],
 ['14',/kho van|van tai|logistics|chuoi cung ung|xuat nhap khau|thu mua|giao nhan/],
 ['15',/kien truc|xay dung|trac dia|cong trinh|giam sat thi cong/],
 ['3',/nghien cuu|khoa hoc|hoa hoc|vat ly|phong thi nghiem/],
 ['2',/co khi|dien tu|ky thuat|ky su|tu dong hoa|san xuat|bao tri/],
 ['6',/kinh doanh|ban hang|quan ly|quan tri|giam doc|truong phong|tu van/]
];
function groupFor(text){const folded=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase();for(const [id,re] of viRules)if(re.test(folded))return {id,axes:rules.find(r=>r[0]===id)[2]};for(const [id,re,axes] of rules)if(re.test(text))return {id,axes};return {id:'16',axes:[0,0,0,0]}}
function clean(v,max=200){return typeof v==='string'?v.replace(/<[^>]*>/g,'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):''}
function safeURL(raw){if(typeof raw!=='string'||raw.length>2048)return null;try{const u=new URL(raw);const allowed=u.hostname==='www.arbeitnow.com'||u.hostname==='arbeitnow.com'||u.hostname==='jooble.org'||u.hostname.endsWith('.jooble.org');if(allowed&&u.protocol==='http:')u.protocol='https:';return allowed&&u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}}
function normalizeTitle(title){return title.toLowerCase().normalize('NFKC').replace(/\([^)]*\)|\[[^\]]*\]/g,' ').replace(/\b(senior|junior|sr|jr|lead|principal|staff|m\/w\/d|w\/m\/d|m\/f\/d|remote|hybrid|full.time|part.time)\b/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
function aggregate(jobs,{fetchedAt=new Date().toISOString(),pages=1,provider='jooble',totalAvailable=null}={}){
 if(!Array.isArray(jobs))throw Error('Dữ liệu API không hợp lệ.');const seen=new Set(),roles=new Map();let validJobs=0,newest=null,oldest=null;
 for(const j of jobs){const title=clean(j?.title),url=safeURL(j?.url);if(!title||!url||seen.has(url))continue;seen.add(url);const key=normalizeTitle(title);if(key.length<3)continue;const stamp=typeof j.created_at==='number'?j.created_at*1000:NaN;const createdAt=Number.isFinite(stamp)&&stamp>0&&stamp<=Date.now()+86400000?new Date(stamp).toISOString():null;const tags=Array.isArray(j.tags)?j.tags.filter(t=>typeof t==='string').map(t=>clean(t,60)).slice(0,12):[];const group=groupFor(title+' '+tags.join(' '));validJobs++;
 if(createdAt){if(!newest||createdAt>newest)newest=createdAt;if(!oldest||createdAt<oldest)oldest=createdAt;}
 if(!roles.has(key))roles.set(key,{id:provider+':'+key,title,groupId:group.id,axes:group.axes,count:0,latestAt:createdAt,examples:[],tags,locations:[]});const role=roles.get(key);role.count++;if(createdAt&&(!role.latestAt||createdAt>role.latestAt))role.latestAt=createdAt;if(role.examples.length<3)role.examples.push({title,url,company:clean(j.company_name,100),createdAt});const location=clean(j.location,100);if(location&&!role.locations.includes(location)&&role.locations.length<3)role.locations.push(location);
 }
 const careers=[...roles.values()].sort((a,b)=>b.count-a.count||(b.latestAt||'').localeCompare(a.latestAt||'')||a.id.localeCompare(b.id)).slice(0,50);
 if(!careers.length)throw Error('Nguồn không có chức danh hợp lệ.');return {version:VERSION,provider,source:provider==='jooble'?'Jooble Việt Nam':'Arbeitnow',sourceUrl:provider==='jooble'?'https://vn.jooble.org/':'https://www.arbeitnow.com/api/job-board-api',scope:provider==='jooble'?'Mẫu tin có vị trí Việt Nam từ Jooble; không phải bảng xếp hạng toàn thị trường.':'Mẫu tin quốc tế, thiên về Đức/châu Âu; không đại diện Việt Nam.',totalAvailable:Number.isInteger(totalAvailable)?totalAvailable:null,fetchedAt,sampleSize:validJobs,distinctTitles:roles.size,pages,newestAt:newest,oldestAt:oldest,careers};
}
function validateSnapshot(s){return !!s&&s.version===VERSION&&['jooble','arbeitnow'].includes(s.provider)&&Number.isFinite(Date.parse(s.fetchedAt))&&Array.isArray(s.careers)&&s.careers.length>0&&s.careers.length<=50&&s.careers.every(c=>typeof c.title==='string'&&c.title.length<=200&&/^(?:jooble|arbeitnow):/.test(c.id)&&/^(?:[1-9]|1[0-6])$/.test(c.groupId)&&Array.isArray(c.axes)&&c.axes.length===4&&c.axes.every(n=>Number.isFinite(n)&&Math.abs(n)<=1)&&Number.isInteger(c.count)&&c.count>0&&Array.isArray(c.examples)&&c.examples.length<=3&&c.examples.every(x=>x&&typeof x==='object'&&safeURL(x.url)&&typeof x.title==='string'&&x.title.length<=200))}
function rank(points,snapshot,limit=5){if(!validateSnapshot(snapshot))throw Error('Bản dữ liệu nghề không hợp lệ.');const pairs=['EI','SN','TF','JP'];if(!pairs.every(p=>Number.isInteger(points[p[0]])&&Number.isInteger(points[p[1]])&&points[p[0]]>=0&&points[p[1]]>=0&&points[p[0]]+points[p[1]]===10))throw Error('Điểm không hợp lệ.');const contrast=pairs.map(p=>(points[p[0]]-points[p[1]])/10),maxCount=Math.max(...snapshot.careers.map(c=>c.count));
 return snapshot.careers.map(c=>{const contribution=contrast.map((n,i)=>n*c.axes[i]),fit=.5+contribution.reduce((a,b)=>a+b,0)/8,demand=Math.log1p(c.count)/Math.log1p(maxCount);const rankScore=.85*fit+.15*demand;const reasons=pairs.flatMap((p,i)=>contribution[i]>.05?[`${contrast[i]>0?p[0]:p[1]}: ${points[contrast[i]>0?p[0]:p[1]]}/10; gần với giả định khám phá của nhóm nghề này.`]:[]);return {...c,rankScore,reasons:reasons.length?reasons:['Các cặp chưa tạo ưu tiên rõ; thứ tự tham khảo thêm tần suất trong mẫu tin.']}}).sort((a,b)=>b.rankScore-a.rankScore||b.count-a.count||a.id.localeCompare(b.id)).slice(0,limit);
}
return {VERSION,groupFor,aggregate,rank,validateSnapshot,safeURL,normalizeTitle};
});
