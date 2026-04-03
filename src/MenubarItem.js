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
      /* &:focus {
        outline:none;
      } */
    }
  }
  li:has(a:focus) {
    background-color:var(--bg-color);
  }
  ::slotted(desktop-menu) {
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

  static observedAttributes = ["active", "expanded"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  get label() {
    return this.querySelector("[slot=label]");
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (typeof bool !== "boolean") throw new TypeError("active value must be a boolean");

    const a = this.shadowRoot.querySelector("a");
    if (bool) {
      this.setAttribute("active", "");
      a.tabIndex = 0;
    } else {
      this.removeAttribute("active");
      a.tabIndex = -1;
    }
  }

  get expanded() {
    const attr = this.shadowRoot.querySelector("a").getAttribute("aria-expanded");
    return attr === "true";
  }

  set expanded(bool) {
    if (typeof bool !== "boolean") throw new TypeError("expanded value must be a boolean");

    this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
    this.shadowRoot.querySelector("a").setAttribute("aria-expanded", String(bool));

    if (!bool) {
      this.querySelectorAll("desktop-menu-item, desktop-menu-checkbox").forEach(item => {
        item.active = false;
        if (item.hasSubmenu) item.expanded = false;
      })
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.shadowRoot.querySelector("a").focus();
    } else if (prop === "expanded" && this.hasSubmenu) {
      const boolValue = (value != null);
      if (this.expanded !== boolValue) this.expanded = boolValue;
    }
  }

}

customElements.define("desktop-menubar-item", MenubarItem);