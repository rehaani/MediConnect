
type Status = "Open" | "In Progress" | "Closed";

export type Ticket = {
  id: string;
  userName: string;
  userEmail: string;
  issue: string;
  images: string[];
  status: Status;
  createdAt: string;
};

// This is a mock, in-memory store for tickets.
// In a real app, this would be a connection to Firestore.
const createTicketStore = () => {
  let tickets: Ticket[] = [
    {
        id: 'ticket-1',
        userName: 'Alex Doe',
        userEmail: 'alex.doe@example.com',
        issue: 'I cannot log in to my account. It says password incorrect but I am sure it is correct. I tried resetting it but did not receive an email.',
        images: ['https://picsum.photos/seed/support1/200/200'],
        status: 'Open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ticket-2',
        userName: 'Dr. Evelyn Reed',
        userEmail: 'dr.evelyn.reed@medconnect.com',
        issue: 'The video consultation screen is not loading for one of my patients. The screen is just blank. I have attached a screenshot.',
        images: ['https://picsum.photos/seed/support2/200/200'],
        status: 'In Progress',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  ];
  let listeners: (() => void)[] = [];

  return {
    addTicket: (ticket: Ticket) => {
      tickets = [ticket, ...tickets];
      listeners.forEach(l => l());
    },
    getTickets: () => tickets,
    updateTicket: (id: string, updates: Partial<Ticket>) => {
      tickets = tickets.map(t => t.id === id ? { ...t, ...updates } : t);
      listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
      listeners.push(listener);
    },
    unsubscribe: (listener: () => void) => {
      listeners = listeners.filter(l => l !== listener);
    },
  };
};

// Singleton store
let store: ReturnType<typeof createTicketStore>;

export const getTicketStore = () => {
  if (!store) {
    store = createTicketStore();
  }
  return store;
};
