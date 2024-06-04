document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector(".content");
    const inputRow = content.querySelector(".add-field");
    const inputText = inputRow.querySelector(".add-text");
    const addItemButton = inputRow.querySelector(".add-submit");
    const template = document.getElementById("row-template").content;
    const buyList = document.querySelector(".buylist");
    const toBuySection = buyList.querySelector("#shopping-list-row:nth-of-type(2)");
    const boughtSection = buyList.querySelector("#shopping-list-row:nth-of-type(4)");

    // три спочатку продукти
    const Items = [
        { name: "Помідори", amount: 4, bought: false },
        { name: "Печиво", amount: 4, bought: false },
        { name: "Сир", amount: 4, bought: false }
    ];

    Items.forEach(item => addItem(item.name, item.amount, item.bought));

    // новий продукт
    function addItem(name, amount = 1, bought = false) {
        const clone = document.importNode(template, true);
        const row = clone.querySelector(".row");
        const productName = row.querySelector(".product-item");
        productName.style.textDecoration = "none";
        const amountSpan = row.querySelector(".amount");
        const addButton = row.querySelector("[data-tooltip='додати товар']");
        const removeButton = row.querySelector("[data-tooltip='видалити товар']");
        const boughtButton = row.querySelector("[data-tooltip='куплено']");
        const cancelButton = row.querySelector("[data-tooltip='відмінити']");

        productName.textContent = name;
        amountSpan.textContent = amount;

        addEventListenersToRow(row, productName, amountSpan, addButton, removeButton, boughtButton, cancelButton);

        content.appendChild(clone);

        addToLeftSummarySection(name);
    }

    // лісенери
    function addEventListenersToRow(row, productName, amountSpan, addButton, removeButton, boughtButton, cancelButton) {
        addButton.addEventListener("click", () => {
            amountSpan.textContent = parseInt(amountSpan.textContent) + 1;

            const itemIndex = Items.findIndex(item => item.name === productName.textContent);
            Items[itemIndex].amount = parseInt(amountSpan.textContent);
        });

        removeButton.addEventListener("click", () => {
            const amount = parseInt(amountSpan.textContent);
            if (amount > 1) {
                amountSpan.textContent = amount - 1;
            }

            const itemIndex = Items.findIndex(item => item.name === productName.textContent);
            Items[itemIndex].amount = parseInt(amountSpan.textContent);
        });

        boughtButton.addEventListener("click", markAsBought);

        cancelButton.addEventListener("click", () => {
            row.remove();
            Items.splice(Items.findIndex(item => item.name === productName.textContent), 1);
            deleteFromSummarySection(productName.textContent);
        });

        productName.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = productName.textContent;
            row.replaceChild(input, productName);

            input.addEventListener("blur", () => {
                productName.textContent = input.value;
                row.replaceChild(productName, input);
            });

            input.focus();
        });
    }

    // позначити що куплене
    function markAsBought() {
        const row = this.parentNode.parentNode;

        const productName = row.querySelector(".product-item");
        const addButton = row.querySelector("[data-tooltip='додати товар']");
        const removeButton = row.querySelector("[data-tooltip='видалити товар']");
        const boughtButton = row.querySelector("[data-tooltip='куплено']");
        const cancelButton = row.querySelector("[data-tooltip='відмінити']");

        productName.style.textDecoration = "line-through";
        addButton.remove();
        removeButton.remove();
        cancelButton.remove();

        boughtButton.textContent = "скасувати";
        boughtButton.dataset.tooltip = "unbought";

        deleteFromSummarySection(productName.textContent);
        addToBoughtSummarySection(productName.textContent);

        boughtButton.removeEventListener("click", markAsBought);
        boughtButton.addEventListener("click", markAsUnbought);
    }

    // позначити типу не куплене знов
    function markAsUnbought() {
        const row = this.parentNode.parentNode;

        const productName = row.querySelector(".product-item");
        const amountSpan = row.querySelector(".amount");
        const boughtButton = row.querySelector("[data-tooltip='unbought']");
        const addButton = document.createElement("button");
        addButton.dataset.tooltip = "додати товар";
        addButton.textContent = "+";
        const removeButton = document.createElement("button");
        removeButton.dataset.tooltip = "видалити товар";
        removeButton.textContent = "-";
        const cancelButton = document.createElement("button");
        cancelButton.dataset.tooltip = "відмінити";
        cancelButton.textContent = "X";

        const addButtonsDiv = row.querySelector("#all-add");
        addButtonsDiv.insertBefore(addButton, amountSpan);
        addButtonsDiv.appendChild(removeButton);

        const buyButtonsDiv = row.querySelector("#all-buy");
        buyButtonsDiv.appendChild(cancelButton, boughtButton);

        boughtButton.textContent = "куплено";
        boughtButton.dataset.tooltip = "куплено";

        boughtButton.removeEventListener("click", markAsUnbought);
        addEventListenersToRow(row, productName, amountSpan, addButton, removeButton, boughtButton, cancelButton);

        deleteFromSummarySection(productName.textContent);
        addToLeftSummarySection(productName.textContent);
        productName.style.textDecoration = "none";
    }

    function deleteFromSummarySection(name) {
        const elements = Array.from(document.querySelectorAll("#item > #item-summary-text"));

        const element = elements.find(element => element.textContent === name);

        if (element) {
            element.parentNode.remove();
        }
    }

    function addToLeftSummarySection(name) {
        const summaryTemplate = document.importNode(document.getElementById("summary-template").content, true);
        const summaryItemName = summaryTemplate.querySelector("#item > #item-summary-text");
        const summaryItemAmount = summaryTemplate.querySelector("#item > #item-amount");

        summaryItemName.textContent = name;
        summaryItemAmount.textContent = Items.find(item => item.name === name).amount;

        toBuySection.appendChild(summaryTemplate);
    }

    function addToBoughtSummarySection(name) {
        const summaryTemplate = document.importNode(document.getElementById("summary-template").content, true);
        const summaryItemName = summaryTemplate.querySelector("#item > #item-summary-text");
        const summaryItemAmount = summaryTemplate.querySelector("#item > #item-amount");

        summaryItemName.textContent = name;
        summaryItemAmount.textContent = Items.find(item => item.name === name).amount;

        boughtSection.appendChild(summaryTemplate);
    }

    // Event listener for adding new items
    addItemButton.addEventListener("click", () => {
        const itemName = inputText.value.trim();
        if (itemName && !Items.some(item => item.name === itemName)) {
            Items.push({ name: itemName, amount: 1, bought: false });
            addItem(itemName);
        }

        inputText.value = "";
        inputText.focus();
    });

    inputRow.addEventListener("submit", (e) => {
        e.preventDefault();
        addItemButton.click();
    });
});
