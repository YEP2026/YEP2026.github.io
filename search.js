// Search widget shared by the student and admin pages: "Phone number" or "School + name".
// handlers: loadSchools() → string[], byPhone(phone), byName(school, query) → response; onResults(response).
// Without byName (the student page) only the phone search is shown.
export function mountSearch(root, { loadSchools, byPhone, byName, onResults }) {
  root.innerHTML = `
    <div class="tabs" ${byName ? '' : 'hidden'}>
      <button type="button" data-tab="phone" class="active">Phone number</button>
      <button type="button" data-tab="name">School + name</button>
    </div>
    <form data-form="phone">
      <input name="phone" type="tel" inputmode="tel" placeholder="e.g. 01012345678" required>
      <button>Search</button>
    </form>
    <form data-form="name" hidden>
      <select name="school" required><option value="">Loading schools…</option></select>
      <input name="query" placeholder="Your name (at least 2 letters)" minlength="2" required autocomplete="off">
      <button>Search</button>
    </form>`;

  const forms = { phone: root.querySelector('[data-form=phone]'), name: root.querySelector('[data-form=name]') };
  forms.phone.onsubmit = e => {
    e.preventDefault();
    run(forms.phone, () => byPhone(forms.phone.phone.value));
  };
  if (!byName) return;

  root.querySelectorAll('[data-tab]').forEach(tab => (tab.onclick = () => {
    root.querySelectorAll('[data-tab]').forEach(t => t.classList.toggle('active', t === tab));
    for (const [key, form] of Object.entries(forms)) form.hidden = key !== tab.dataset.tab;
  }));

  loadSchools().then(schools => {
    const select = forms.name.school;
    select.innerHTML = '<option value="">Choose your school</option>' +
      schools.map(s => `<option>${escapeHtml(s)}</option>`).join('');
  });

  async function run(form, request) {
    const button = form.querySelector('button');
    button.disabled = true;
    button.textContent = 'Searching…';
    try {
      onResults(await request());
    } finally {
      button.disabled = false;
      button.textContent = 'Search';
    }
  }
  forms.name.onsubmit = e => {
    e.preventDefault();
    run(forms.name, () => byName(forms.name.school.value, forms.name.query.value));
  };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
