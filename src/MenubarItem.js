import MenuItem from "./MenuItem.js";
import MenuCheckbox from "./MenuCheckbox.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    --bg-color:rgb(213, 220, 238);
  }
  :host([active]) li {
    background-color:var(--bg-color);
  }
  li {
    position:relative;
    margin:0;
    padding:0.3rem 1rem;
    &:hover {
      background-color:var(--bg-color);
    }
    a {
      text-decoration:none;
      color:inherit;
      cursor:default;
    }
  }
  li:has(a:focus) {
    background-color:var(--bg-color);
  }
  slot[name=menu]::slotted(*) {
    position:absolute;
    margin-left:-1em;
    margin-top:0.1rem;
  }
`);

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <a role="menuitem" href="#" aria-haspopup="true" aria-expanded="false" tabindex="-1">
      <slot></slot>
    </a>
    <slot name="menu" hidden></slot>
  </li>
`

export default class MenubarItem extends HTMLElement {

  static observedAttributes = ["active", "expanded", "focusable"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  get focusable() {
    return this.hasAttribute("focusable");
  }

  set focusable(value) {
    if (value) this.setAttribute("focusable", "");
    else this.removeAttribute("focusable");
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(value) {
    if (value) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  connectedCallback() {
    const a = this.shadowRoot.querySelector("a");
    a.addEventListener("click", e => e.preventDefault());
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => (
      node instanceof MenuItem || node instanceof MenuCheckbox
    ))
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value == null) this.focusable = false;
      else {
        this.focusable = true;
        this.shadowRoot.querySelector("a").focus();
      }

    } else if (prop === "expanded") {
      const bool = (value != null);
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      this.shadowRoot.querySelector("a").setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if (item.hasSubmenu) item.expanded = false;
        })
      }

    } else if (prop === "focusable") {
      this.shadowRoot.querySelector("a").tabIndex = (value == null) ? -1 : 0;
    }
  }

}

customElements.define("desktop-menubar-item", MenubarItem);