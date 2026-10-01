(() => {
  const K=Klondike, $=id=>document.getElementById(id);
  let state=K.deal(), initial=K.clone(state), history=[], selected=null, started=null, elapsed=0, finished=false, pending=null, dragRef=null, suppressClick=false;
  const names=['Spades','Hearts','Clubs','Diamonds'], ranks=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const same=(a,b)=>a&&b&&a.kind===b.kind&&a.pile===b.pile&&a.index===b.index;
  const say=text=>{$('message').textContent=text;};
  function timer(){ if(started&&!finished) elapsed=Math.floor((Date.now()-started)/1000); $('time').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`; }
  function apply(next){ if(!next)return false; history.push(K.clone(state));state=next;if(!started)started=Date.now();selected=null;render();if(K.won(state)&&!finished){timer();finished=true;$('win-detail').textContent=`All 52 cards home in ${$('time').textContent}, with ${state.moves} moves.`;$('victory').showModal();}return true; }
  function choose(ref){
    if(suppressClick){suppressClick=false;return;}
    if(selected && !same(selected,ref) && apply(K.move(state,selected,ref))) {say('Nice. Keep building.');return;}
    if(same(selected,ref)){selected=null;render();return;}
    if(K.cards(state,ref).length){selected=ref;render();say('Choose a column or foundation for the selected card.');}
    else say('That card cannot be moved yet.');
  }
  function destination(to){ if(selected){if(apply(K.move(state,selected,to)))say('Card moved.');else say(to.kind==='foundation'?'Build each suit from Ace to King.':'Build down in alternating colors. Empty columns need a King.');} }
  function auto(ref){for(let p=0;p<4;p++)if(apply(K.move(state,ref,{kind:'foundation',pile:p}))){say('Card moved to its foundation.');return;}}
  function card(c,ref,top=0,left=0){
    const b=document.createElement('button');b.className=`card${c.up?K.red(c)?' red':'':' back'}`;b.style.top=`${top}px`;b.style.left=`${left}px`;b.dataset.ref=JSON.stringify(ref);
    b.setAttribute('aria-label',c.up?`${ranks[c.rank]} of ${names[c.suit]}${ref.kind==='tableau'?`, column ${ref.pile+1}`:''}`:'Face-down card');
    if(c.up){b.innerHTML=`<span class="corner">${ranks[c.rank]}<small>${K.suits[c.suit]}</small></span><span class="suit-center">${K.suits[c.suit]}</span><span class="corner bottom" aria-hidden="true">${ranks[c.rank]}<small>${K.suits[c.suit]}</small></span>`;
      if(K.cards(state,ref).length){b.draggable=true;b.addEventListener('click',e=>{e.stopPropagation();choose(ref);});b.addEventListener('dblclick',e=>{e.preventDefault();auto(ref);});
        b.addEventListener('dragstart',e=>{dragRef=ref;selected=ref;e.dataTransfer.setData('text/plain',JSON.stringify(ref));e.dataTransfer.effectAllowed='move';b.classList.add('dragging');});
        b.addEventListener('dragend',()=>{dragRef=null;suppressClick=false;render();});
      }else{b.addEventListener('click',e=>{e.stopPropagation();say('Only the top waste card is playable.');});b.tabIndex=-1;}
    }else{b.disabled=true;b.setAttribute('aria-hidden','true');}
    if(selected&&selected.kind===ref.kind&&selected.pile===ref.pile&&ref.index>=selected.index)b.classList.add('selected');
    return b;
  }
  function dropzone(el,to){el.dataset.target=JSON.stringify(to);el.addEventListener('click',()=>destination(to));el.addEventListener('dragover',e=>{if(dragRef&&K.legal(state,dragRef,to)){e.preventDefault();e.dataTransfer.dropEffect='move';el.classList.add('drop-target');}});el.addEventListener('dragleave',()=>el.classList.remove('drop-target'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('drop-target');if(dragRef)apply(K.move(state,dragRef,to));dragRef=null;});}
  function render(){
    $('moves').textContent=state.moves;$('progress').textContent=`${state.foundations.reduce((n,p)=>n+p.length,0)} / 52`;$('undo').disabled=!history.length;
    $('stock').className=`slot${state.stock.length?' back':''}`;$('stock').textContent=state.stock.length?'':state.waste.length?'↶':'—';$('stock').disabled=!state.stock.length&&!state.waste.length;$('stock').setAttribute('aria-label',state.stock.length?'Draw three cards':'Recycle waste into stock');$('stock-count').textContent=`${state.stock.length} cards`;
    $('waste').replaceChildren();const count=Math.min(3,state.waste.length),fan=Math.min(15,document.querySelector('.slot').getBoundingClientRect().width*.14);
    state.waste.slice(-count).forEach((c,i)=>$('waste').append(card(c,{kind:'waste',pile:0,index:state.waste.length-count+i},0,i*fan)));
    $('foundations').replaceChildren();state.foundations.forEach((p,i)=>{const el=document.createElement('div');el.className='foundation';const slot=document.createElement('button');slot.className='slot';slot.textContent=K.suits[i];slot.setAttribute('aria-label',`${names[i]} foundation`);el.append(slot);dropzone(el,{kind:'foundation',pile:i});if(p.length)el.append(card(p.at(-1),{kind:'foundation',pile:i,index:p.length-1}));$('foundations').append(el);});
    $('tableau').replaceChildren();const step=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--step'))||Math.min(34,Math.max(23,innerWidth*.034));
    state.tableau.forEach((p,i)=>{const el=document.createElement('div');el.className='pile';dropzone(el,{kind:'tableau',pile:i});const slot=document.createElement('button');slot.className='slot';slot.setAttribute('aria-label',`Column ${i+1}${p.length?'':' — empty, King only'}`);if(!p.length)slot.textContent='K';el.append(slot);p.forEach((c,j)=>el.append(card(c,{kind:'tableau',pile:i,index:j},j*step)));el.style.height=`${Math.max(p.length-1,0)*step+document.querySelector('.slot').getBoundingClientRect().height+36}px`;$('tableau').append(el);});
  }
  function reset(restart=false){state=restart?K.clone(initial):K.deal();initial=K.clone(state);history=[];selected=null;started=null;elapsed=0;finished=false;timer();render();say('Select a card, then its destination. Double-click to send it home.');}
  function confirm(restart=false){if(!state.moves){reset(restart);return;}pending=restart;$('confirm-title').textContent=restart?'Restart this deal?':'Deal a new game?';$('confirm-ok').textContent=restart?'Restart':'Deal cards';$('confirm').showModal();}
  $('stock').addEventListener('click',()=>{if(apply(K.draw(state)))say(state.stock.length?'Three cards drawn. Only the top waste card is playable.':'Stock empty. Click it again to recycle.');});
  $('undo').addEventListener('click',()=>{if(!history.length)return;state=history.pop();selected=null;finished=false;render();say('Last move undone.');});
  $('hint').addEventListener('click',()=>{const m=K.moves(state)[0];if(m){selected=m.from;render();document.querySelectorAll('[data-target]').forEach(el=>{const t=JSON.parse(el.dataset.target);if(t.kind===m.to.kind&&t.pile===m.to.pile)el.classList.add('hinted');});say(`Try moving ${ranks[K.cards(state,m.from)[0].rank]} of ${names[K.cards(state,m.from)[0].suit]} to ${m.to.kind==='foundation'?'its foundation':`column ${m.to.pile+1}`}.`);}else if(state.stock.length||state.waste.length){say('No useful move is visible. Draw or recycle the stock; this does not guarantee a move.');$('stock').classList.add('hinted');}else say('No forward move is available. Try undoing or starting a new deal.');});
  $('new').addEventListener('click',()=>confirm());$('restart').addEventListener('click',()=>confirm(true));$('cancel').addEventListener('click',()=>$('confirm').close());$('confirm-ok').addEventListener('click',()=>{$('confirm').close();reset(pending);});$('rules').addEventListener('click',()=>$('help').showModal());document.querySelector('#help .close').addEventListener('click',()=>$('help').close());$('win-new').addEventListener('click',()=>{$('victory').close();reset();});$('win-close').addEventListener('click',()=>$('victory').close());
  document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='Escape'){selected=null;render();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undo').click();}if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('stock').click();}});
  window.addEventListener('resize',render);setInterval(timer,1000);render();
})();
