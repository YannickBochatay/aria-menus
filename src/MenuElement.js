const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    --bg-color:rgb(213, 220, 238);
    --icon-width:1rem;
    --icon-margin:0 0.4rem 0 0;
    --margin-left:1.4rem;
  }
  :host([active]) li {
    background-color:var(--bg-color);
  }
  :host([disabled]) li {
    background-color:unset;
    .label {
      opacity:0.7;
      font-style:italic;
      cursor:not-allowed;
    }
  }
  :host([nocaret]) li .caret {
    display:none;
  }
  li {
    padding:0.2rem 0.3rem;
    margin:0;
    position:relative;
    box-sizing:border-box;
    display:flex;
    align-items:center;
    cursor:default;
    &:hover {
      background-color:var(--bg-color);
    }
    [role^=menuitem] {
      display:flex;
      align-items:center;
      color:inherit;
      flex:1;
    }
    ::slotted(a) {
      color:inherit;
    }
    .icon {
      width:var(--icon-width);
      margin:var(--icon-margin);
      display:inline-block;
    }
    ::slotted([slot=icon]) {
      width:var(--icon-width);
      vertical-align:middle;
    }
    .label {
      white-space:nowrap;
      flex:1;
    }
    .info {
      opacity:0.7;
      font-size:0.9rem;
      margin-left:var(--margin-left);
    }
  }
  ::slotted([slot=menu]) {
    z-index:1;
  }
`);

export const labelTemplate = `
  <span aria-hidden="true" class="icon">
    <slot name="icon"></slot>
  </span>
  <span class="label">
    <slot></slot>
  </span>
  <span class="info">
    <slot name="info"></slot>
  </span>
`

export default class MenuElement extends HTMLElement {

  static observedAttributes = ["active", "info", "focusable"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
  }

  get info() {
    return this.getAttribute("info");
  }

  set info(value) {
    if (typeof value !== "string") throw new TypeError("info must be a string");
    this.setAttribute("info", value);
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get focusable() {
    return this.hasAttribute("focusable");
  }

  set focusable(value) {
    if (value) this.setAttribute("focusable", "");
    else this.removeAttribute("focusable");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  #getSlotLabel() {
    return this.shadowRoot.querySelector("slot:not([name])");
  }

  get label() {
    const slottedNodes = [...this.#getSlotLabel().assignedNodes()];
    return slottedNodes.reduce((label, elmt) => label + elmt.textContent.trim(), "");
  }

  connectedCallback() {
    const slottedLabel = this.querySelector("[slot=label]");
    if (slottedLabel) {
      slottedLabel.removeAttribute("slot");
      this.#getSlotLabel().assign(slottedLabel);
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    const menuItem = this.shadowRoot.querySelector("[role^=menuitem]");
    if (prop === "active") {
      if (value != null) menuItem.focus();
    } else if (prop === "info") {
      const node = this.shadowRoot.querySelector(".info")
      if (node) node.textContent = value;
    } else if (prop === "focusable") {
      menuItem.tabIndex = (value == null) ? -1 : 0;
    }
  }
}