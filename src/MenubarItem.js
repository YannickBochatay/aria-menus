const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  li {
    position:relative;
    margin:0;
    padding:0.3rem 1rem;
    &:hover {
      background-color:rgba(213, 220, 238, 1);
    }
    a {
      text-decoration:none;
      color:inherit;
      cursor:default;
    }
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
    <a role="menuitem" href="#" aria-haspopup="true" aria-expanded="false">
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

  get expanded() {
    const attr = this.shadowRoot.querySelector("a").getAttribute("aria-expanded");
    return attr === "true";
  }

  set expanded(bool) {
    if (typeof bool !== "boolean") throw new TypeError("expanded value must be a boolean");

    this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
    this.shadowRoot.querySelector("a").setAttribute("aria-expanded", String(bool));

    if (!bool) {
      this.querySelectorAll("desktop-menu-item").forEach(item => {
        item.active = false;
        item.expanded = false;
      })
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.shadowRoot.querySelector(".focusedElmt").focus();
    } else if (prop === "expanded" && this.hasSubmenu) {
      this.expanded = (value != null);
    }
  }

}

customElements.define("desktop-menubar-item", MenubarItem);