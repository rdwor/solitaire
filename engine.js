/* Standard Klondike, draw three, unlimited redeals. */
(function (root) {
  const suits = ['♠', '♥', '♣', '♦'];
  const red = c => c.suit === 1 || c.suit === 3;
  const clone = s => JSON.parse(JSON.stringify(s));
  function deal(random = Math.random) {
    const deck = suits.flatMap((_, suit) => Array.from({length:13}, (_, i) => ({suit, rank:i+1, up:false})));
    for (let i=51; i>0; i--) { const j=Math.floor(random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    const tableau = Array.from({length:7}, () => []);
    for (let row=0; row<7; row++) for (let col=row; col<7; col++) { const c=deck.pop(); c.up=row===col; tableau[col].push(c); }
    return {stock:deck, waste:[], tableau, foundations:[[],[],[],[]], moves:0, passes:0};
  }
  function pile(s, ref) { return ref.kind==='tableau' ? s.tableau[ref.pile] : ref.kind==='foundation' ? s.foundations[ref.pile] : ref.kind==='waste' ? s.waste : null; }
  function cards(s, ref) {
    const p=pile(s,ref); if (!p || !Number.isInteger(ref.index) || ref.index<0 || ref.index>=p.length) return [];
    if (ref.kind!=='tableau' && ref.index!==p.length-1) return [];
    const group=p.slice(ref.index);
    return group.every((c,i)=>c.up && (!i || (group[i-1].rank===c.rank+1 && red(group[i-1])!==red(c)))) ? group : [];
  }
  function legal(s, from, to) {
    if (!['tableau','foundation'].includes(to.kind) || !Number.isInteger(to.pile) || to.pile<0 || to.pile>=(to.kind==='tableau'?7:4)) return false;
    if (from.kind===to.kind && from.pile===to.pile) return false;
    const group=cards(s,from); if (!group.length) return false;
    const c=group[0], p=pile(s,to), top=p.at(-1);
    if (to.kind==='foundation') return group.length===1 && c.suit===to.pile && c.rank===p.length+1;
    return top ? top.up && top.rank===c.rank+1 && red(top)!==red(c) : c.rank===13;
  }
  function move(s, from, to) {
    if (!legal(s,from,to)) return null;
    const next=clone(s), source=pile(next,from), group=source.splice(from.index);
    pile(next,to).push(...group);
    if (from.kind==='tableau' && source.length) source.at(-1).up=true;
    next.moves++; return next;
  }
  function draw(s) {
    if (!s.stock.length && !s.waste.length) return null;
    const next=clone(s);
    if (next.stock.length) for (let i=0; i<3 && next.stock.length; i++) { const c=next.stock.pop(); c.up=true; next.waste.push(c); }
    else { next.stock=next.waste.reverse().map(c=>({...c,up:false})); next.waste=[]; next.passes++; }
    next.moves++; return next;
  }
  function sources(s, includeFoundations=true) {
    const result=[];
    s.tableau.forEach((p,k)=>p.forEach((c,i)=>{if(c.up) result.push({kind:'tableau',pile:k,index:i});}));
    if(s.waste.length) result.push({kind:'waste',pile:0,index:s.waste.length-1});
    if(includeFoundations) s.foundations.forEach((p,k)=>{if(p.length) result.push({kind:'foundation',pile:k,index:p.length-1});});
    return result;
  }
  function moves(s) {
    const result=[];
    for (const from of sources(s,false)) for (const kind of ['foundation','tableau']) for(let p=0;p<(kind==='tableau'?7:4);p++) {
      const to={kind,pile:p}; if(legal(s,from,to)) {
        // Moving an entire King column to an empty column does not advance play.
        if(kind==='tableau' && !s.tableau[p].length && from.kind==='tableau' && from.index===0) continue;
        const reveal=from.kind==='tableau' && from.index>0 && !s.tableau[from.pile][from.index-1].up;
        result.push({from,to,priority:reveal?0:kind==='foundation'?1:from.kind==='waste'?2:3});
      }
    }
    return result.sort((a,b)=>a.priority-b.priority);
  }
  const won = s => s.foundations.every(p=>p.length===13);
  const api={suits,red,clone,deal,pile,cards,legal,move,draw,sources,moves,won};
  if(typeof module!=='undefined') module.exports=api; else root.Klondike=api;
})(typeof globalThis!=='undefined'?globalThis:this);
