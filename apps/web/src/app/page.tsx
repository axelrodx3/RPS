import { brand, environment } from "@/config/brand";

const foundations = [
  {
    number: "01",
    title: "On-chain authority",
    copy: "Balances, locked wagers, rules, outcomes, credits, and withdrawals are designed to remain program-authoritative.",
  },
  {
    number: "02",
    title: "Atomic match funding",
    copy: "Waiting lobbies never debit funds. A funded match starts only when every required wager can be locked together.",
  },
  {
    number: "03",
    title: "Private, verifiable moves",
    copy: "Canonical commitments, strict phases, and independently verifiable settlement form the fairness foundation.",
  },
  {
    number: "04",
    title: "Safe expansion",
    copy: "Shared platform services stay separate from immutable, versioned game-rule modules.",
  },
] as const;

const modes = [
  ["1v1", "First to two non-tied rounds"],
  ["2v2", "Fixed teams, paired round scoring"],
  ["1v1v1v1", "Four-player, two-life elimination"],
] as const;

const milestones = [
  "Product and protocol architecture",
  "State machines and financial invariants",
  "Threat model and audit gates",
  "Testing and mainnet-readiness plan",
] as const;

export default function FoundationPreview() {
  return (
    <main>
      <div className="environment-banner" role="status">
        <span className="status-dot" aria-hidden="true" />
        {environment.label} · {environment.network} · NO REAL SOL
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="RPS foundation home">
          <span className="mark" aria-hidden="true">
            R
          </span>
          {brand.name}
        </a>
        <nav aria-label="Preview navigation">
          <a href="#architecture">Architecture</a>
          <a href="#modes">Rules</a>
          <a href="#safety">Safety</a>
        </nav>
        <button
          className="ghost-button"
          disabled
          title="Wallet integration begins in a later phase"
        >
          Connect wallet
        </button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">Product architecture · Prompt 1</div>
        <h1>
          Rock. Paper. Scissors.
          <span>Built for verifiable competition.</span>
        </h1>
        <p className="hero-copy">
          {brand.tagline} RPS is being designed as a mobile-first Solana
          application with transparent accounting, private moves, and
          esports-grade match presentation.
        </p>
        <div className="hero-actions" aria-label="Disabled product previews">
          <button className="primary-button" disabled>
            Play with SOL · Disabled
          </button>
          <button className="secondary-button" disabled>
            Practice · Coming later
          </button>
        </div>
        <p className="safety-note">
          This preview contains no wallet transactions, deposits, withdrawals,
          wagering, or live game services.
        </p>
      </section>

      <section
        className="foundation-grid"
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <div className="section-heading">
          <span>System foundation</span>
          <h2 id="architecture-title">
            Designed around explicit trust boundaries.
          </h2>
        </div>
        <div className="cards">
          {foundations.map((item) => (
            <article className="foundation-card" key={item.number}>
              <span className="card-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mode-section"
        id="modes"
        aria-labelledby="modes-title"
      >
        <div>
          <span className="section-kicker">Immutable rule versions</span>
          <h2 id="modes-title">
            Three competitive formats. One shared platform.
          </h2>
          <p>
            Every funded match will permanently record its mode, rules, timer,
            fee, wager, payout formula, and fallback method.
          </p>
        </div>
        <div className="mode-list">
          {modes.map(([name, description]) => (
            <div className="mode-row" key={name}>
              <strong>{name}</strong>
              <span>{description}</span>
              <span className="planned-badge">Planned</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="safety-section"
        id="safety"
        aria-labelledby="safety-title"
      >
        <div className="safety-panel">
          <span className="section-kicker">Production gates</span>
          <h2 id="safety-title">
            Real-value play stays off until the hard problems are proven.
          </h2>
          <p>
            Automatic fallback fairness, selective non-reveal resistance, scoped
            sessions, atomic funding, withdrawals, and settlement all require
            implementation, adversarial testing, and independent audit.
          </p>
          <div className="disabled-controls">
            <button disabled>Deposit disabled</button>
            <button disabled>Withdraw disabled</button>
            <button disabled>Admin disabled</button>
            <button disabled>Play vs CPU — Coming Soon</button>
          </div>
        </div>
        <aside className="milestone-panel" aria-label="Foundation deliverables">
          <span>Foundation deliverables</span>
          <ul>
            {milestones.map((milestone) => (
              <li key={milestone}>
                <span aria-hidden="true">✓</span>
                {milestone}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <footer>
        <span>{brand.name} · Foundation preview</span>
        <span>No funds · No mainnet · No production claims</span>
      </footer>
    </main>
  );
}
