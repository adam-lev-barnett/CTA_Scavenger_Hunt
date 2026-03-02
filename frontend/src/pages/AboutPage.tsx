import { Link } from 'react-router-dom';

const STEPS = [
  { n: '01', title: 'Register & sign in',       body: 'Create a free account. Demo mode is available if the backend is offline.' },
  { n: '02', title: 'Pick a CTA station',        body: 'Open the map and select any L-train station to head toward.' },
  { n: '03', title: 'Check in on arrival',       body: 'When you\'re within range, tap Check In to earn points and unlock nearby spots.' },
  { n: '04', title: 'Discover nearby spots',     body: 'Each station unlocks nearby cultural landmarks, parks, and hidden Chicago gems.' },
  { n: '05', title: 'Collect stamps',            body: 'Every visit earns a stamp in your book. Watch your collection grow neighborhood by neighborhood.' },
  { n: '06', title: 'Climb the rankings',        body: 'Weekly scores reset every Sunday. Can you reach the top?' },
];

const LINES = [
  { name: 'Red',    color: '#c60c30' },
  { name: 'Blue',   color: '#00a1de' },
  { name: 'Brown',  color: '#62361b' },
  { name: 'Green',  color: '#009b3a' },
  { name: 'Orange', color: '#f9461c' },
  { name: 'Purple', color: '#522398' },
  { name: 'Pink',   color: '#e27ea6' },
  { name: 'Yellow', color: '#f9e300' },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-12 animate-fade-up">

      {/* Hero */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-cta-blue">About</p>
        <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight">
          Discover Chicago,<br />one stop at a time.
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
          Chica-Go turns every CTA ride into a guided exploration of Chicago's neighborhoods, history, and culture.
        </p>
        <Link to="/map" className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-cta-blue text-white text-sm font-medium hover:bg-cta-blue/90 transition-all">
          Open the Map →
        </Link>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-zinc-500">How it works</h2>
        <div className="space-y-px">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="flex gap-4 p-4 rounded-lg hover:bg-white/[0.02] transition-colors group animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="font-display font-bold text-xl text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0 tabular-nums w-8">
                {s.n}
              </span>
              <div>
                <p className="font-display font-semibold text-sm text-white">{s.title}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Lines */}
      <div className="space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-zinc-500">The Chicago 'L'</h2>
        <div className="grid grid-cols-4 gap-2">
          {LINES.map(l => (
            <div
              key={l.name}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
              style={{
                background: `${l.color}12`,
                borderLeft: `3px solid ${l.color}`,
                color: l.color === '#f9e300' ? '#c8b800' : l.color,
              }}
            >
              {l.name}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
