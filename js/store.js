
const STORAGE_KEY = "kasvy_cart_v1";

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const cart = raw ? JSON.parse(raw) : {};

        if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(cart).filter(([id, item]) =>
                item &&
                item.id === id &&
                typeof item.name === "string" &&
                typeof item.img === "string" &&
                Number.isFinite(item.price) &&
                item.price >= 0 &&
                Number.isSafeInteger(item.quantity) &&
                item.quantity > 0
            )
        );
    } catch (error) {
        console.warn("No se pudo recuperar el carrito.", error);
        return {};
    }
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn("No se pudo guardar el carrito.", error);
    }
}

const ADD_ITEM = "ADD_ITEM";
const INC_ITEM = "INC_ITEM";
const DEC_ITEM = "DEC_ITEM";
const DEL_ITEM = "DEL_ITEM";

function cartReducer(state = loadState(), action) {
    switch (action.type) {
        case ADD_ITEM: {
            const { id, name, price, img } = action.payload;
            const existing = state[id];

            return {
                ...state,
                [id]: {
                    id,
                    name,
                    price,
                    img,
                    quantity: existing ? existing.quantity + 1 : 1
                }
            };
        }

        case INC_ITEM: {
            const { id } = action.payload;

            if (!state[id]) return state;

            return {
                ...state,
                [id]: {
                    ...state[id],
                    quantity: state[id].quantity + 1
                }
            };
        }

        case DEC_ITEM: {
            const { id } = action.payload;

            if (!state[id]) return state;

            const next = { ...state };

            if (state[id].quantity <= 1) {
                delete next[id];
            } else {
                next[id] = {
                    ...state[id],
                    quantity: state[id].quantity - 1
                };
            }

            return next;
        }

        case DEL_ITEM: {
            const { id } = action.payload;
            const next = { ...state };

            delete next[id];
            return next;
        }

        default:
            return state;
    }
}

function createStore(reducer) {
    let state = reducer(undefined, { type: "@@INIT" });
    const listeners = new Set();

    return {
        dispatch(action) {
            state = reducer(state, action);
            saveState(state);
            listeners.forEach(listener => listener());
        },

        getState() {
            return state;
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}

window.VQStore = createStore(cartReducer);

window.VQActions = {
    ADD_ITEM,
    INC_ITEM,
    DEC_ITEM,
    DEL_ITEM
};