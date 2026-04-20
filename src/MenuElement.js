const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    --icon-width:1rem;
    --bg-color:rgb(213, 220, 238);
    --margin-left:1rem;
    --icon-margin:0 0.4rem 0 0;
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
  :host([nocaret]) li .arrow {
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
    &:has(a:focus) {
      background-color:var(--bg-color);
    }
    [role^=menuitem] {
      color:inherit;
      flex:1;
    }
    .label {
      white-space:nowrap;
      flex:1;
    }
    .arrow {
      font-size:0.6rem;
      margin-left:var(--margin-left);
      cursor:default;
    }
  }
  ::slotted([slot=menu]) {
    z-index:1;
  }
  :host([direction=row]), :host([type]) {
    li {
      [role^=menuitem] {
        display:flex;
        align-items:baseline;
      }

      .icon {
        width:var(--icon-width);
        margin:0 5px 0 0;
        display:inline-block;
      }
      ::slotted([slot=icon]) {
        width:var(--icon-width);
        vertical-align:middle;
      }
      
      .info {
        opacity:0.7;
        font-size:0.9rem;
        margin-left:15px;
      }
    }
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

  get label() {
    return [...this.childNodes]?.find(node => node.nodeName === "#text" && node.nodeValue.trim())?.nodeValue.trim();
  }

  connectedCallback() {
    const slottedLabel = this.querySelector("[slot=label]");
    if (slottedLabel) {
      slottedLabel.removeAttribute("slot");
      this.shadowRoot.querySelector("slot:not([name])").assign(slottedLabel);
    }

    if (!this.hasAttribute("direction")) {
      this.setAttribute("direction", "row");
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