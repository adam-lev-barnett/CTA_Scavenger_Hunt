import { FormEvent, useState } from 'react';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [subject,   setSubject]   = useState('');
  const [message,   setMessage]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.pageTitle}>Get in touch</h1>
        <p className={styles.pageSubtitle}>Bug report, feature idea, or just want to say hi?</p>
      </div>

      {submitted ? (
        <div className={styles.successCard}>
          <p className={styles.successCheck}>✓</p>
          <h3 className={styles.successTitle}>Message sent</h3>
          <p className={styles.successBody}>We'll get back to you as soon as possible.</p>
          <button
            className={styles.resetBtn}
            onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className={styles.contactForm}>
          <div className={styles.twoCol}>
            <div>
              <label className={styles.label}>Name</label>
              <input className={styles.input} type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={styles.label}>Subject</label>
            <input className={styles.input} type="text" placeholder="Bug / Feature / Other" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div>
            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="What's on your mind?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Send Message
          </button>
        </form>
      )}

      <div className={styles.infoGrid}>
        {[
          { emoji: '🐛', title: 'Found a bug?',    body: 'Describe what happened and we\'ll fix it fast.' },
          { emoji: '📍', title: 'Suggest a spot',  body: 'Know a hidden Chicago gem? We\'ll add it.' },
        ].map(c => (
          <div key={c.title} className={styles.infoCard}>
            <span className={styles.infoEmoji}>{c.emoji}</span>
            <p className={styles.infoTitle}>{c.title}</p>
            <p className={styles.infoBody}>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
