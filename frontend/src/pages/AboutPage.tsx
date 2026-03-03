import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

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
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>About</p>
        <h1 className={styles.heroTitle}>
          Discover Chicago,<br />one stop at a time.
        </h1>
        <p className={styles.heroBody}>
          Chica-Go turns every CTA ride into a guided exploration of Chicago's neighborhoods, history, and culture.
        </p>
        <Link to="/map" className={styles.heroLink}>Open the Map →</Link>
      </div>

      {/* How it works */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.stepsList}>
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={styles.stepRow}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={styles.stepNum}>{s.n}</span>
              <div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Lines */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>The Chicago 'L'</h2>
        <div className={styles.linesGrid}>
          {LINES.map(l => (
            <div
              key={l.name}
              className={styles.lineBadge}
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
