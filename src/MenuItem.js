import MenuElement, { labelTemplate } from "./MenuElement.js";
import MenuList from "./MenuList.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  [role=menuitem].hasSubmenu::after {
    content:"▶";
    font-size:0.6rem;
    margin-left:var(--margin-left);
    cursor:default;
  }
  :host([direction=column]) li {
    [role=menuitem].hasSubmenu::after {
      transform:rotate(90deg);
    }
    slot[name=menu]::slotted(*) {
      position:absolute;
      top:100%;
      margin-left:-1em;
    }
  }
  :host([direction=column][expanded]) {
    [role=menuitem].hasSubmenu::after {
      transform:rotate(-90deg);
    }
  }
  :host([direction=row]) {
    slot[name=menu]::slotted(*) {
      position:absolute;
      left:100%;
      top:0;
    }
  }
    
`);

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <span role="menuitem" tabindex="-1" aria-haspopup="true" aria-expanded="false">
      ${labelTemplate}
    </span>
    <slot name="menu" hidden></slot>
  </li>
`

export default class MenuItem extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "expanded"];

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets.push(style);
  }

  get hasSubmenu() {
    return Boolean(this.shadowRoot.querySelector("slot[name=menu]").assignedNodes().length)
  }

  get expanded() {
    return this.hasSubmenu && this.hasAttribute("expanded");
  }

  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  #findMenuList() {
    return [...this.children].find(child => child instanceof MenuList);
  }

  #handleSubmenuKeyNavigation(e) {
    const expandKey = (this.direction === "column") ? "ArrowDown" : "ArrowRight"
    const hideKey = (this.direction === "column") ? null : "ArrowLeft"

    switch (e.key) {

      case hideKey: case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
          this.active = true;
        }
        break;

      case expandKey: case "Enter": case " ": {
        e.preventDefault();
        if (!this.expanded) {
          e.stopPropagation();
          this.expanded = true;
        }
        const list = this.#findMenuList()
        if (!list.items.some(item => item.active)) list.activeItem(0);
        break;
      }
    }
  }

  #handleSimpleItemKeyNavigation(e) {
    switch (e.key) {
      case "Enter": case " ": {
        const link = this.querySelector("a");
        if (link) this.querySelector("a")?.click();
        else this.dispatchEvent(new Event("click", { target : this }));
        break;
      }
    }
  }

  #handleKeyNavigation = e => {
    if (this.disabled) return;
    this.hasSubmenu ? this.#handleSubmenuKeyNavigation(e) : this.#handleSimpleItemKeyNavigation(e);
  }

  connectedCallback() {
    this.addEventListener("keydown", this.#handleKeyNavigation);
    if (!this.hasAttribute("direction")) this.direction = "row";

    const menuSlot = this.shadowRoot.querySelector("slot[name=menu]");
    menuSlot.addEventListener("slotchange", () => {
      const menuItem = this.shadowRoot.querySelector("[role=menuitem]");
      const method = (menuSlot.assignedNodes().length) ? "add" : "remove";
      menuItem.classList[method]("hasSubmenu");
    })

    // remove focus for inner link
    const link = this.querySelector("a")
    if (link && !link.hasAttribute("tabindex")) link.tabIndex = -1;
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => node instanceof MenuElement)
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);

    if (prop === "expanded" && this.hasSubmenu) {
      const bool = (value != null);
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      this.shadowRoot.querySelector("[role=menuitem]").setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if ("expanded" in item) item.expanded = false;
        })
      }
    }
  }

}
