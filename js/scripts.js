
function getTotalItems(cart) {
    return Object.values(cart).reduce(
        (total, item) => total + item.quantity,
        0
    );
}

function getTotalCost(cart) {
    return Object.values(cart).reduce(
        (total, item) => total + item.quantity * item.price,
        0
    );
}

function formatMoney(amount) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(amount) + " MXN";
}


function updateCartCount() {
    const count = document.getElementById("cart-count");

    if (count) {
        count.textContent = String(
            getTotalItems(window.VQStore.getState())
        );
    }
}


function initShopPage() {
    const buttons = document.querySelectorAll(".add-to-cart");

    function updateButtons() {
        const cart = window.VQStore.getState();

        buttons.forEach(button => {
            const id = button.dataset.id;
            const added = Boolean(id && cart[id]);

            button.disabled = added;
            button.textContent = added
                ? "En tu carrito"
                : "Agregar al carrito";
        });
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".card");
            if (!card) return;

            const id = card.dataset.id;
            const price = Number(card.dataset.price);

            if (!id || !Number.isFinite(price) || price < 0) {
                return;
            }

            window.VQStore.dispatch({
                type: window.VQActions.ADD_ITEM,
                payload: {
                    id,
                    name: card.dataset.name || "Planta",
                    price,
                    img: card.dataset.img || ""
                }
            });
        });
    });

    window.VQStore.subscribe(updateButtons);
    updateButtons();
}


function renderCartPage() {
    const container = document.getElementById("cart-items");
    const totalItems = document.getElementById("total-items");
    const totalCost = document.getElementById("total-cost");
    const checkout = document.getElementById("checkout-btn");

    if (!container) return;

    function createButton(text, label, action, id) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = text;
        button.setAttribute("aria-label", label);

        if (action === window.VQActions.DEL_ITEM) {
            button.className = "btn secondary";
        }

        button.addEventListener("click", () => {
            window.VQStore.dispatch({
                type: action,
                payload: { id }
            });
        });

        return button;
    }

    function refresh() {
        const cart = window.VQStore.getState();
        const items = Object.values(cart);

        if (totalItems) {
            totalItems.textContent = String(getTotalItems(cart));
        }

        if (totalCost) {
            totalCost.textContent = getTotalCost(cart).toFixed(2);
        }

        if (checkout) {
            checkout.disabled = items.length === 0;
        }

        container.replaceChildren();

        if (items.length === 0) {
            const message = document.createElement("p");
            message.textContent =
                "Tu carrito está vacío. Explora la tienda y encuentra tu próxima planta.";

            const link = document.createElement("a");
            link.href = "products.html";
            link.className = "btn primary";
            link.textContent = "Explorar plantas";

            container.append(message, link);
            return;
        }

        items.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item";

            const image = document.createElement("img");
            image.src = item.img;
            image.alt = item.name;

            const meta = document.createElement("div");
            meta.className = "meta";

            const name = document.createElement("strong");
            name.textContent = item.name;

            const price = document.createElement("div");
            price.className = "unit";
            price.textContent =
                "Precio unitario: " + formatMoney(item.price);

            const subtotal = document.createElement("div");
            subtotal.className = "unit";
            subtotal.textContent =
                "Subtotal: " + formatMoney(item.price * item.quantity);

            meta.append(name, price, subtotal);

            const controls = document.createElement("div");
            controls.className = "qty-controls";

            const quantity = document.createElement("span");
            quantity.textContent = String(item.quantity);
            quantity.setAttribute(
                "aria-label",
                "Cantidad de " + item.name
            );

            controls.append(
                createButton(
                    "−",
                    "Reducir cantidad de " + item.name,
                    window.VQActions.DEC_ITEM,
                    item.id
                ),
                quantity,
                createButton(
                    "+",
                    "Aumentar cantidad de " + item.name,
                    window.VQActions.INC_ITEM,
                    item.id
                ),
                createButton(
                    "Eliminar",
                    "Eliminar " + item.name + " del carrito",
                    window.VQActions.DEL_ITEM,
                    item.id
                )
            );

            row.append(image, meta, controls);
            container.appendChild(row);
        });
    }

    if (checkout) {
        checkout.addEventListener("click", () => {
            alert(
                "Esta es una tienda de demostración académica. " +
                "Todavía no se procesan pedidos ni pagos."
            );
        });
    }

    window.VQStore.subscribe(refresh);
    refresh();
}


document.addEventListener("DOMContentLoaded", () => {
    if (!window.VQStore || !window.VQActions) {
        console.error("No se pudo cargar el sistema del carrito.");
        return;
    }

    window.VQStore.subscribe(updateCartCount);
    updateCartCount();

    if (document.querySelector(".add-to-cart")) {
        initShopPage();
    }

    if (document.getElementById("cart-items")) {
        renderCartPage();
    }
});

