/**
 * Shared test helpers and Firebase mock setup.
 *
 * Every test file that touches Firebase should import these mocks
 * BEFORE importing application code.
 */

// ── In-memory Firestore mock ──────────────────────────────────

const collections = {};

function getCollection(name) {
    if (!collections[name]) collections[name] = {};
    return collections[name];
}

let autoIdCounter = 0;
function nextId() {
    autoIdCounter += 1;
    return `mock-id-${autoIdCounter}`;
}

export function resetFirestoreMock() {
    Object.keys(collections).forEach((k) => delete collections[k]);
    autoIdCounter = 0;
}

/** Simulates a Firestore document reference */
function docRef(collectionName, id) {
    return {
        id,
        get: async () => {
            const data = getCollection(collectionName)[id];
            return {
                exists: !!data,
                id,
                data: () => (data ? { ...data } : undefined),
            };
        },
        set: async (data) => {
            getCollection(collectionName)[id] = { ...data };
        },
        update: async (data) => {
            const col = getCollection(collectionName);
            col[id] = { ...col[id], ...data };
        },
        delete: async () => {
            delete getCollection(collectionName)[id];
        },
    };
}

/** Simulates a Firestore collection reference */
function collectionRef(name) {
    return {
        doc: (id) => docRef(name, id),
        add: async (data) => {
            const id = nextId();
            getCollection(name)[id] = { ...data };
            return { id };
        },
        where: () => queryRef(name),
    };
}

/** Simulates chained Firestore query */
function queryRef(name) {
    return {
        where: () => queryRef(name),
        orderBy: () => queryRef(name),
        limit: () => queryRef(name),
        offset: () => queryRef(name),
        get: async () => {
            const col = getCollection(name);
            const docs = Object.entries(col).map(([id, data]) => ({
                id,
                data: () => ({ ...data }),
            }));
            return { docs, size: docs.length };
        },
    };
}

/** The mock Firestore db object */
export const mockDb = {
    collection: (name) => collectionRef(name),
};

/** The mock Firebase Auth object */
export const mockAuth = {
    verifyIdToken: async (token) => {
        if (token === 'valid-token') {
            return { uid: 'test-uid', email: 'test@example.com', name: 'Test User', picture: '' };
        }
        throw new Error('Invalid token');
    },
    createUser: async (data) => ({
        uid: nextId(),
        email: data.email,
        displayName: data.displayName || '',
    }),
};

/** Mock firebase-admin default export */
export const mockAdmin = {
    apps: [{}],
    firestore: () => mockDb,
    auth: () => mockAuth,
    credential: { cert: () => ({}) },
    initializeApp: () => { },
};
