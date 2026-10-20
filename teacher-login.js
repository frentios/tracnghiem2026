(() => {
if(CONFIG.supabaseUrl&&CONFIG.supabaseAnonKey){location.replace('admin.html');return;}
if(TeacherAuth.active()){location.replace('admin.html');return;}
const form=document.querySelector('#teacher-form'),status=document.querySelector('#login-status'),password=document.querySelector('#password');
document.querySelector('#show-password').onchange=ev=>password.type=ev.target.checked?'text':'password';
form.onsubmit=async ev=>{ev.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='Đang đăng nhập…';status.className='';try{if(!await TeacherAuth.signIn(form.elements.username.value.trim(),password.value)){status.textContent='Tài khoản hoặc mật khẩu không đúng.';status.className='error';password.focus();return;}password.value='';location.replace('admin.html');}catch{status.textContent='Không thể tạo phiên đăng nhập. Hãy cho phép lưu trữ phiên và mở website qua HTTPS hoặc máy chủ cục bộ.';status.className='error';}finally{button.disabled=false;}};
})();
