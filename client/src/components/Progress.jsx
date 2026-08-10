const STEPS = ['Your details', 'Pick a time', 'Confirmed'];

export default function Progress({ current = 2 }) {
  return (
    <nav className="progress" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const state = index < current ? 'done' : index === current ? 'active' : 'todo';

        return (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            {i > 0 && <span className="progress__link" aria-hidden="true" />}
            <span
              className="progress__node"
              data-state={state}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span className="progress__bullet" aria-hidden="true">
                {index}
              </span>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
