// Local UI gate only. This cannot secure localStorage or a static website.
window.TeacherAuth = {
  key: 'laban-teacher-session',
  active() { try { return sessionStorage.getItem(this.key) === 'active'; } catch { return false; } },
  async signIn(username, password) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    if (username !== 'admin' || hex !== '5bdebd567695b24bdef61c0945832f7bcf2efac27bb4b9cfbb0ba7b0e060c95d') return false;
    sessionStorage.setItem(this.key, 'active');
    return true;
  },
  signOut() { try { sessionStorage.removeItem(this.key); } catch {} }
};
