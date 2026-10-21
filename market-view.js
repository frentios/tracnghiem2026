(() => {
const C=Core,E=CareerEngine,e=C.el;
function showSnapshot(container,pack){
 const list=e('div',undefined,'career-grid');
 const info=e('p',`${pack.source} · Tải lúc ${new Date(pack.fetchedAt).toLocaleString('vi-VN')} · ${pack.sampleSize} tin trong mẫu · ${pack.careerCount}/50 chức danh.`, 'small');
 container.append(info,e('p',pack.scope,'small'));
 container.append(e('p','Thuật toán tham khảo: 85% đối chiếu xu hướng trong bài làm với giả định nhóm nghề, 15% tần suất chức danh trong mẫu tin. Không phải tỷ lệ phù hợp đã được kiểm định.','small'));
 pack.recommendations.forEach((career,index)=>{const card=e('article',undefined,'card');const group=DATA.careers.find(c=>c.id===career.groupId);card.append(e('span','GỢI Ý '+(index+1),'eyebrow'),e('h3',career.title),e('p','Nhóm khám phá: '+(group?.name||'Nhóm ngành khác')),e('p',career.count+' tin có chức danh tương tự trong mẫu; không phải tổng nhu cầu thị trường.'));
 const ul=e('ul');career.reasons.forEach(reason=>ul.append(e('li',reason)));card.append(ul,e('p','Có thể rèn: '+(group?.skills||'Tự học và tìm hiểu yêu cầu công việc.')));
 career.examples.forEach(example=>{const link=e('a',example.title+(example.company?' — '+example.company:'')+' →','source-link');link.href=example.url;link.target='_blank';link.rel='noopener noreferrer';card.append(link)});card.append(e('p','Đây là ví dụ tin tuyển dụng, không phải đề nghị ứng tuyển cho học sinh. Hãy tìm hiểu chương trình đào tạo, yêu cầu đầu vào và trải nghiệm nghề.','small'));list.append(card)});container.append(list);
}
function restore(pack,points){
 if(!pack||!['jooble','arbeitnow'].includes(pack.provider)||!Array.isArray(pack.recommendations)||pack.recommendations.length>5)return null;
 const snapshot={version:E.VERSION,provider:pack.provider,source:pack.source,fetchedAt:pack.fetchedAt,careers:Array.isArray(pack.catalog)?pack.catalog:pack.recommendations};if(!E.validateSnapshot(snapshot))return null;
 return {...pack,version:E.VERSION,recommendations:E.rank(points,snapshot)};
}
async function mount(host,r,onSave){
 const status=e('p','Đang kiểm tra dữ liệu nghề mới từ internet…');status.setAttribute('role','status');const body=e('div'),actions=e('div',undefined,'actions');
 const retry=e('button','Tải lại dữ liệu nghề','secondary no-print');retry.type='button';const localLink=e('a','Xem gợi ý nhóm ngành ↓','button secondary no-print');localLink.href='#local-career-groups';localLink.hidden=true;actions.append(retry,localLink);function notConfigured(){retry.hidden=true;localLink.hidden=false;status.className='privacy';status.textContent='Chưa có bản dữ liệu tuyển dụng trực tuyến cho website này. Bạn vẫn có thể xem các nhóm ngành tham khảo theo kết quả trắc nghiệm bên dưới.';}host.append(e('div',CONFIG.market?.provider==='arbeitnow'?'DỮ LIỆU TUYỂN DỤNG QUỐC TẾ':'DỮ LIỆU TUYỂN DỤNG VIỆT NAM','eyebrow'),e('h2','Khám phá nghề từ nguồn tuyển dụng'),status,body,actions);
 const previous=restore(r.market,r.points);if(previous){r.market=previous;showSnapshot(body,previous);status.textContent='Đang hiển thị dữ liệu đã lưu cùng kết quả; bấm tải lại nếu muốn cập nhật.';}
 async function refresh(){retry.disabled=true;status.textContent='Đang kiểm tra dữ liệu nghề mới từ internet…';try{const market=await Market.refresh();const pack=Market.pack(r.points,market);r.market=pack;C.store(r);onSave?.(pack);if(!host.isConnected)return;body.replaceChildren();showSnapshot(body,pack);status.textContent=market.state==='snapshot'?'Đã tải bản dữ liệu công khai của website. Nguồn được cập nhật theo lịch; thời điểm lấy nguồn ghi bên dưới.':'Không tải được dữ liệu mới; đang dùng bản lưu lúc '+new Date(pack.fetchedAt).toLocaleString('vi-VN')+'. '+market.error;if(market.unavailable){retry.hidden=true;localLink.hidden=false;}if(!market.saved&&market.state==='snapshot')status.textContent+=' Trình duyệt không lưu được bản dự phòng.';status.className=market.state==='snapshot'?'privacy':'note';}
 catch(err){if(!host.isConnected)return;if(err.code==='DATA_UNAVAILABLE'){notConfigured();if(previous)status.textContent+=' Bản dữ liệu đã lưu vẫn hiển thị bên dưới.';return;}status.className='note';status.textContent=err.message+(previous?' Đang hiển thị bản đã lưu, không phải dữ liệu vừa tải.':' Chưa có dữ liệu internet để đề xuất nghề; các nhóm tham khảo cục bộ vẫn có bên dưới.');}
 finally{retry.disabled=false;}}
 retry.onclick=refresh;if(!Market.availability().available){notConfigured();if(previous)status.textContent+=' Bên dưới là bản dữ liệu đã lưu, không phải dữ liệu vừa cập nhật.';}else if(!previous)await refresh();
}
window.MarketView={mount,restore};
})();
