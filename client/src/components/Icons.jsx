const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Check = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Arrow = (p) => (
  <svg {...base} width={17} height={17} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const FormIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M8 13h8M8 17h5" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4M9 15h2" />
  </svg>
);

export const ConfirmIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
  </svg>
);

export const Layers = (p) => (
  <svg {...base} {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 16.5 12 21l9-4.5" />
  </svg>
);

export const Brain = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5a3 3 0 0 0-6 0 3 3 0 0 0-1 5.8A3 3 0 0 0 8 17a3 3 0 0 0 4 2z" />
    <path d="M12 5a3 3 0 0 1 6 0 3 3 0 0 1 1 5.8A3 3 0 0 1 16 17a3 3 0 0 1-4 2z" />
  </svg>
);

export const Signal = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12.5a9 9 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0" />
    <circle cx="12" cy="19" r="1.2" />
  </svg>
);

export const Devices = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="4" width="14" height="11" rx="1.5" />
    <path d="M2 18h11" />
    <rect x="16" y="9" width="6" height="11" rx="1.5" />
  </svg>
);

export const Drone = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <path d="M9 9 5 5M15 9l4-4M9 15l-4 4M15 15l4 4" />
    <circle cx="4" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </svg>
);

export const Cloud = (p) => (
  <svg {...base} {...p}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97 6 6 0 0 0-11.6 1.4A3.8 3.8 0 0 0 7 19z" />
  </svg>
);

export const Factory = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M3 20V10l5 3V10l5 3V7l5 3v10z" />
  </svg>
);

export const Shield = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
  </svg>
);

export const Leaf = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M5 19C5 10 11 5 20 5c0 9-5 14-14 14z" />
    <path d="M5 19c3-5 7-8 11-9" />
  </svg>
);

export const Truck = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7" />
    <circle cx="6" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
);

export const City = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M3 21V9l6-3v15M9 21V6l6 3v12M15 21V9l6 3v9" />
  </svg>
);

export const Heart = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
  </svg>
);

export const Mail = (p) => (
  <svg {...base} width={17} height={17} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const Phone = (p) => (
  <svg {...base} width={17} height={17} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </svg>
);

export const Pin = (p) => (
  <svg {...base} width={17} height={17} {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const LinkedIn = (p) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9.5 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.03-3.07-1.93-3.07-1.93 0-2.23 1.46-2.23 2.97V21h-4z" />
  </svg>
);

export const Instagram = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const WhatsApp = (p) => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.45 1.34 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01a9.9 9.9 0 0 0 9.93-9.9A9.9 9.9 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.31-1.96 1.36-.5.05-1.14.07-1.83-.11a16.6 16.6 0 0 1-1.66-.61c-2.92-1.26-4.83-4.2-4.98-4.4-.14-.2-1.19-1.58-1.19-3.02s.76-2.14 1.03-2.44c.27-.3.58-.37.78-.37h.56c.18 0 .42-.7.65.5.24.57.83 2.01.9 2.16.7.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.64-.8.17-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.73-.17 1.42Z" />
  </svg>
);
