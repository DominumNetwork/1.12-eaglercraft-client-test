(() => {
  'use strict';

  const CATEGORIES = {
    Combat: ["AutoClick Assist","Aim Trainer","Hit Color","Crosshair Dynamic","Damage Particles","Combo Counter","Ping Spoof Visual","Hit Sound","Target HUD","Reach Visualizer"],
    Movement: ["Auto Sprint","Toggle Sneak","Safe Walk","Parkour Assist","Step Assist","Momentum HUD","Strafe Helper","Jump Indicator","Zoom","FOV Changer"],
    Player: ["Auto Tool Select","Auto Re-equip","Hotbar Profiles","Armor Durability","Auto Respawn","Screenshot Key","Waypoint Manager","Inventory Search","Crafting Helper","Chat Timestamp"],
    Visual: ["FullBright","Clear Water","No Hurt Cam","Weather Toggle","Item Physics Lite","Block Outline+","Motion Blur Fake","Sky Color","Chunk Borders","Entity Count HUD"],
    Misc: ["FPS Booster","Low-End Mode","Lazy Chunk Animations","Particle Reducer","Shadow Disable","Sound Limiter","GC Hint","Menu Blur","UI Scale","Keybind Editor"],
    Cosmetics: ["Cape Toggle","Animated Cape","Hat Overlay","Wings Overlay","Nickname Color","Gradient Text","HUD Accent","Chat Font Size","Custom Cursor","Emote Wheel"],
  };

  const state = {
    open: false,
    active: JSON.parse(localStorage.getItem('client.active') || '{}'),
    keybinds: JSON.parse(localStorage.getItem('client.keybinds') || '{}'),
    hud: JSON.parse(localStorage.getItem('client.hud') || '{"x":20,"y":20,"color":"#5cf2ff","show":true}'),
    panels: JSON.parse(localStorage.getItem('client.panels') || '{}'),
    accent: localStorage.getItem('client.accent') || '#5cf2ff',
    lowEnd: localStorage.getItem('client.lowend') === '1',
    skin: localStorage.getItem('client.skin') || null
  };

  const save = () => {
    localStorage.setItem('client.active', JSON.stringify(state.active));
    localStorage.setItem('client.keybinds', JSON.stringify(state.keybinds));
    localStorage.setItem('client.hud', JSON.stringify(state.hud));
    localStorage.setItem('client.panels', JSON.stringify(state.panels));
    localStorage.setItem('client.accent', state.accent);
    localStorage.setItem('client.lowend', state.lowEnd ? '1' : '0');
    if(state.skin) localStorage.setItem('client.skin', state.skin);
  };

  const root = document.createElement('div');
  root.id = 'ec-client-root';
  root.innerHTML = `
    <style>
      #ec-client-root{position:fixed;inset:0;pointer-events:none;font-family:Inter,Segoe UI,Arial,sans-serif;z-index:99999;color:#fff}
      .ec-window{position:absolute;width:320px;background:rgba(15,16,22,.9);border:1px solid rgba(255,255,255,.08);border-radius:12px;box-shadow:0 10px 50px rgba(0,0,0,.45);pointer-events:auto;overflow:hidden}
      .ec-head{padding:10px 12px;display:flex;justify-content:space-between;cursor:move;background:linear-gradient(90deg,var(--accent),#7a6cff)}
      .ec-body{max-height:60vh;overflow:auto;padding:10px}
      .ec-row{display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.05)}
      .ec-btn{background:#252734;border:1px solid #3a3f57;color:#fff;border-radius:8px;padding:6px 8px;cursor:pointer}
      .ec-btn.on{background:var(--accent);color:#00131a;font-weight:700}
      .ec-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
      .ec-tab{font-size:12px;padding:4px 8px;border-radius:999px;background:#2a2d3e;cursor:pointer}
      .ec-tab.on{background:var(--accent);color:#031218;font-weight:700}
      .ec-hud{position:fixed;left:20px;top:20px;font-size:14px;text-shadow:0 1px 0 #000;pointer-events:none}
      .ec-panel{position:fixed;right:20px;top:20px;background:rgba(0,0,0,.4);padding:8px 10px;border-radius:8px;max-width:240px;pointer-events:auto}
      .ec-hidden{display:none!important}
    </style>
    <div id="ec-main" class="ec-window ec-hidden"><div class="ec-head"><b>Omni Legit Client</b><span>Right Shift</span></div><div class="ec-body"></div></div>
    <div id="ec-hud" class="ec-hud"></div>
    <div id="ec-panel" class="ec-panel"><div style="font-weight:700;margin-bottom:6px">Customization</div>
      <div class="ec-row"><span>HUD Color</span><input id="ec-color" type="color"></div>
      <div class="ec-row"><span>UI Scale</span><input id="ec-scale" type="range" min="0.8" max="1.4" step="0.05" value="1"></div>
      <div class="ec-row"><span>Low-End Mode</span><button id="ec-lowend" class="ec-btn">Toggle</button></div>
      <div class="ec-row"><span>Import Skin (.png/.mcpack)</span><input id="ec-skin" type="file" accept=".png,.mcpack,.zip"></div>
      <canvas id="ec-skin-preview" width="64" height="64" style="margin-top:8px;border:1px solid #555;image-rendering:pixelated"></canvas>
    </div>`;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(root);
    const main = root.querySelector('#ec-main');
    const body = main.querySelector('.ec-body');
    const hud = root.querySelector('#ec-hud');
    const panel = root.querySelector('#ec-panel');
    root.style.setProperty('--accent', state.accent);
    root.querySelector('#ec-color').value = state.hud.color || state.accent;

    let current = Object.keys(CATEGORIES)[0];

    function renderMain() {
      const tabs = `<div class="ec-tabs">${Object.keys(CATEGORIES).map(c => `<div class="ec-tab ${c===current?'on':''}" data-tab="${c}">${c}</div>`).join('')}</div>`;
      const rows = CATEGORIES[current].map(name => {
        const on = !!state.active[name];
        return `<div class="ec-row"><span>${name}</span><button class="ec-btn ${on?'on':''}" data-mod="${name}">${on?'ON':'OFF'}</button></div>`;
      }).join('');
      body.innerHTML = tabs + rows;
    }

    function renderHUD() {
      if(!state.hud.show){hud.textContent='';return;}
      const active = Object.keys(state.active).filter(k => state.active[k]);
      hud.style.left = `${state.hud.x}px`; hud.style.top = `${state.hud.y}px`; hud.style.color = state.hud.color || state.accent;
      hud.innerHTML = `<b>Active (${active.length})</b><br>${active.map(a=>`• ${a}`).join('<br>')}`;
    }

    function applyPerf() {
      const c = document.querySelector('canvas');
      if(!c) return;
      c.style.imageRendering = state.lowEnd ? 'pixelated' : 'auto';
      c.style.filter = state.active['FullBright'] ? 'brightness(1.25)' : 'none';
      document.body.style.background = state.active['Menu Blur'] ? '#000' : 'black';
    }

    renderMain(); renderHUD(); applyPerf();

    body.addEventListener('click', (e) => {
      const t = e.target;
      if(t.classList.contains('ec-tab')) { current = t.dataset.tab; renderMain(); return; }
      if(t.dataset.mod){ state.active[t.dataset.mod] = !state.active[t.dataset.mod]; save(); renderMain(); renderHUD(); applyPerf(); }
    });

    document.addEventListener('keydown', (e) => {
      if(e.code === 'ShiftRight') { state.open = !state.open; main.classList.toggle('ec-hidden', !state.open); panel.classList.toggle('ec-hidden', !state.open); }
    });

    const head = main.querySelector('.ec-head');
    let dx=0,dy=0,drag=false;
    head.addEventListener('mousedown', (e)=>{drag=true;const r=main.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;});
    document.addEventListener('mousemove', (e)=>{if(!drag)return;main.style.left=`${e.clientX-dx}px`;main.style.top=`${e.clientY-dy}px`;main.style.right='auto';});
    document.addEventListener('mouseup', ()=>drag=false);

    root.querySelector('#ec-color').addEventListener('input', (e)=>{state.hud.color=e.target.value; state.accent=e.target.value; root.style.setProperty('--accent', state.accent); save(); renderMain(); renderHUD();});
    root.querySelector('#ec-lowend').addEventListener('click', ()=>{state.lowEnd=!state.lowEnd;save();applyPerf();});
    root.querySelector('#ec-scale').addEventListener('input', (e)=>{root.style.transform=`scale(${e.target.value})`;root.style.transformOrigin='top left';});

    root.querySelector('#ec-skin').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0]; if(!file) return;
      if(file.name.endsWith('.png')) {
        const data = await file.arrayBuffer();
        state.skin = URL.createObjectURL(new Blob([data], {type:'image/png'}));
      } else {
        alert('Experimental: .mcpack/.zip import requires extracting a PNG skin manually from pack.');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const ctx = root.querySelector('#ec-skin-preview').getContext('2d');
        ctx.clearRect(0,0,64,64); ctx.drawImage(img, 0, 0, 64, 64);
      };
      img.src = state.skin;
      save();
    });

    setInterval(() => { renderHUD(); applyPerf(); }, 1000);
  });
})();
