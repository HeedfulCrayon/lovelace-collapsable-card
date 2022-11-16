console.log(
  `%ccollapsable-cards\n%cVersion: ${"0.0.1"}`,
  "color: rebeccapurple; font-weight: bold;",
  ""
);

class VerticalStackInCard extends HTMLElement {
  constructor() {
    super();
  }

  setConfig(config) {
    const alignments = {
      left: "left",
      center: "center",
      right: "right",
      justify: "space-between",
      even: "space-even",
    };
    this.id = Math.round(Math.random() * 10000);
    this._cardSize = {};
    this._cardSize.promise = new Promise(
      (resolve) => (this._cardSize.resolve = resolve)
    );

    if (!config || !config.cards || !Array.isArray(config.cards)) {
      throw new Error("Supply the `cards` property");
    }

    let isMobile = window.matchMedia(
      "only screen and (max-width: 760px)"
    ).matches;
    if (config.defaultOpen == true) {
      this.isToggled = true;
    } else if (config.defaultOpen == "desktop-only" && !isMobile) {
      this.isToggled = true;
    } else {
      this.isToggled = false;
    }

    if (!config.expand_upward) {
      this.expand_upward = false;
    } else {
      this.expand_upward = config.expand_upward;
    }

    if (config.show_icon === undefined) {
      this.show_icon = true;
    } else {
      this.show_icon = config.show_icon;
    }

    if (config.head === undefined) {
      this.show_head = false;
    } else {
      this.show_head = true;
    }

    if (
      config.content_alignment &&
      Object.keys(alignments).includes(config.content_alignment)
    ) {
      this.content_alignment = alignments[config.content_alignment];
    }

    this._config = config;
    this._refCards = [];
    this.renderCard();
  }

  async renderCard() {
    const config = this._config;
    if (window.loadCardHelpers) {
      this.helpers = await window.loadCardHelpers();
    }

    if (this.show_head) {
      const head_promise = this.createCardElement(config.head);
      this.head = await Promise.resolve(head_promise);
      this.head.className = "head-card-" + this.id;
    }

    const promises = config.cards.map((config) =>
      this.createCardElement(config)
    );
    this._refCards = await Promise.all(promises);

    // Create the card
    const card = document.createElement("ha-card");
    this.card = card;
    const cardList = document.createElement("div");
    this.cardList = cardList;
    card.style.overflow = "hidden";
    this._refCards.forEach((card) => cardList.appendChild(card));
    this.cardList.className = "card-list-" + this.id;
    this.cardList.classList[this.isToggled ? "add" : "remove"]("is-toggled");

    // create the button
    const toggleButton = this.createToggleButton();

    if (this.expand_upward == true) {
      card.appendChild(cardList);
      card.appendChild(toggleButton);
    } else {
      card.appendChild(toggleButton);
      card.appendChild(cardList);
    }

    while (this.hasChildNodes()) {
      this.removeChild(this.lastChild);
    }
    this.appendChild(card);

    // Calculate card size
    this._cardSize.resolve();

    const styleTag = document.createElement("style");
    styleTag.innerHTML = this.getStyles();
    card.appendChild(styleTag);

    if (
      config.defaultOpen === "contain-toggled" &&
      config.cards.filter((c) => this._hass.states[c.entity]?.state === "on")
        .length > 0
    ) {
      toggleButton.click();
    }
  }

  createToggleButton() {
    const toggleButton = document.createElement("button");
    if (this._config.expand_text && !this.isToggled) {
      toggleButton.innerHTML = this._config.expand_text;
    } else if (this._config.collapse_text && this.isToggled) {
      toggleButton.innerHTML = this._config.collapse_text;
    } else if (this.show_head) {
      toggleButton.appendChild(this.head);
    } else {
      toggleButton.innerHTML = this._config.title || "Toggle";
    }
    toggleButton.className = "card-content toggle-button-" + this.id;
    toggleButton.addEventListener("click", () => {
      this.isToggled = !this.isToggled;
      this.styleCard(this.isToggled);
    });

    if (this.show_head) {
      toggleButton.appendChild(this.head);
    }

    if (this.show_icon) {
      const icon = document.createElement("ha-icon");
      icon.className = "toggle-button__icon-" + this.id;
      icon.setAttribute(
        "icon",
        this._config.expand_upward ? "mdi:chevron-up" : "mdi:chevron-down"
      );
      this.icon = icon;
      toggleButton.appendChild(icon);
    }

    this.toggleButton = toggleButton;

    return toggleButton;
  }

  styleCard(isToggled) {
    this.cardList.classList[isToggled ? "add" : "remove"]("is-toggled");
    // this.cardList.classList[isToggled ? 'add' : 'remove']('expanding')
    // this.cardList.classList[isToggled ? 'remove' : 'add']('collapsing')
    if (this.show_icon) {
      const openIcon = this.expand_upward
        ? "mdi:chevron-up"
        : "mdi:chevron-down";
      const closeIcon = this.expand_upward
        ? "mdi:chevron-down"
        : "mdi:chevron-up";
      this.icon.setAttribute("icon", isToggled ? closeIcon : openIcon);
    }
    if (this._config.expand_text || this._config.collapse_text) {
      this.toggleButton.innerHTML = isToggled
        ? this._config.collapse_text
        : this._config.expand_text;
      if (this.show_icon) {
        this.toggleButton.appendChild(this.icon);
      }
    }
  }

  async createCardElement(cardConfig) {
    const createError = (error, origConfig) => {
      return createThing("hui-error-card", {
        type: "error",
        error,
        origConfig,
      });
    };

    const createThing = (tag, config) => {
      if (this.helpers) {
        if (config.type === "divider") {
          return this.helpers.createRowElement(config);
        } else {
          return this.helpers.createCardElement(config);
        }
      }

      const element = document.createElement(tag);
      try {
        element.setConfig(config);
      } catch (err) {
        console.error(tag, err);
        return createError(err.message, config);
      }
      return element;
    };

    let tag = cardConfig.type;
    if (tag.startsWith("divider")) {
      tag = `hui-divider-row`;
    } else if (tag.startsWith("custom:")) {
      tag = tag.substr("custom:".length);
    } else {
      tag = `hui-${tag}-card`;
    }

    const element = createThing(tag, cardConfig);
    element.hass = this._hass;
    element.addEventListener(
      "ll-rebuild",
      (ev) => {
        ev.stopPropagation();
        this.createCardElement(cardConfig).then(() => {
          this.renderCard();
        });
      },
      { once: true }
    );
    return element;
  }

  set hass(hass) {
    this._hass = hass;
    if (this._refCards) {
      this._refCards.forEach((card) => {
        card.hass = hass;
      });
    }
  }

  _computeCardSize(card) {
    if (typeof card.getCardSize === "function") {
      return card.getCardSize();
    }
    return customElements
      .whenDefined(card.localName)
      .then(() => this._computeCardSize(card))
      .catch(() => 1);
  }

  async getCardSize() {
    await this._cardSize.promise;
    const sizes = await Promise.all(this._refCards.map(this._computeCardSize));
    return sizes.reduce((a, b) => a + b);
  }

  getStyles() {
    return `
      .head-card-${this.id} {
        grid-column: 1;
        grid-row: 1;
      }

      .toggle-button-${this.id} {
        color: var(--primary-text-color);
        text-align: left;
        background: var(--card-background-color);
        border: none;
        margin: 0;
        display: grid;
        justify-content: ${
          this.content_alignment ? this.content_alignment : "space-between"
        };
        align-items: center;
        width: 100%;
        padding: 0px;
        border-radius: var(--ha-card-border-radius, 4px);
        align-self: start;
        ${this._config.buttonStyle || ""}
      }
      .toggle-button-${this.id}:focus {
        outline: none;
        background-color: var(--card-background-color);
      }

      .card-list-${this.id} {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: 0;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        border: 0;
        white-space: nowrap;
      }

      .card-list-${this.id}.is-toggled {
        position: unset;
        width: unset;
        height: unset;
        margin: unset;
        padding: unset;
        overflow: unset;
        clip: unset;
        clip-path: unset;
        border: unset;
        white-space: unset;
        ${this.expand_upward ? "padding-bottom: 8px;" : ""}
        ${this.expand_upward ? "" : "padding-top: 8px;"}
      }

      .toggle-button__icon-${this.id} {
        color: var(--paper-item-icon-color, #aaa);
        grid-column: 1;
        grid-row: 1;
        position: absolute;
        top: 16px;
        right: 16px;
      }

      .type-custom-collapsable-cards {
        background: transparent;
      }

      .expanding {
        animation-name: expand;
        animation-duration: 1s;
        animation-timing-function: ease-out;
      }

      @keyframes expand {
        0% { 
          position: absolute;
          width: 1px;
          height: 1px;
          margin: 0;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          border: 0;
          white-space: nowrap;
        }
        100% {
          position: unset;
          width: unset;
          height: unset;
          margin: unset;
          padding: unset;
          overflow: unset;
          clip: unset;
          clip-path: unset;
          border: unset;
          white-space: unset;
          padding-bottom: 8px;
        }
      }

      .collapsing {
        animation-name: collapse;
        animation-duration: 1s;
        animation-timing-function: ease-out;
      }

      @keyframes collapse {
        0% { 
          position: unset;
          width: unset;
          height: unset;
          margin: unset;
          padding: unset;
          overflow: unset;
          clip: unset;
          clip-path: unset;
          border: unset;
          white-space: unset;
          padding-bottom: 8px;
        }
        100% {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: 0;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          border: 0;
          white-space: nowrap;
        }
      }
    `;
  }
}

customElements.define("collapsable-cards", VerticalStackInCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "collapsable-cards",
  name: "Collapsable Card",
  preview: false,
  description:
    "The Collapsable Card allows you to hide other cards behind a dropdown toggle.",
});
