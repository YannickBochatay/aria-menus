import MenuElement from "./MenuElement.js";
import MenuList from "./MenuList.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    position:relative;
    display:inline-block;
  }
  button {
    display:block;
  }
  slot[name=menu]::slotted(*) {
    position:absolute;
    top:100%;
  }
  :host([expanded]) {
    .arrow {
      transform:rotate(-90deg);
    }
  }
  ::slotted([slot=menu]) {
    z-index:1;
  }
`);

const template = document.createElement("template");

template.innerHTML = `
  <button
    type="button"
    id="menubutton"
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="menu"
  >
    <slot></slot>
    <svg width="12" height="9" viewBox="0 0 12 9">
      <polygon points="1 0, 11 0, 6 8"></polygon>
    </svg>
  </button>
  <slot name="menu" hidden id="menu" aria-labelledby="menubutton"></slot>
`

export default class MenuButton extends HTMLElement {

  static observedAttributes = ["expanded"]

  constructor() {
    super();
    this.attachShadow({ mode : "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [style];
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  #findMenuList() {
    return [...this.children].find(child => child instanceof MenuList);
  }

  #handleKeyNavigation = e => {
    switch (e.key) {

      case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
        }
        break;

      case "ArrowDown": case "Enter": case " ":
        if (!this.expanded) {
          e.preventDefault();
          e.stopPropagation();
          this.expanded = true;
          this.#findMenuList().activeItem(0);
        }
        break;
    }
  }

  #handleClick = e => {
    const button = this.shadowRoot.querySelector("button")
    const slot = button.querySelector("slot")
    if (e.target === this || e.target === button || e.target.assignedSlot === slot) {
      this.expanded = !this.expanded
    } else if (!this.contains(e.target) && this.expanded) this.expanded = false;
  }

  connectedCallback() {
    this.addEventListener("keydown", this.#handleKeyNavigation);
    document.addEventListener("click", this.#handleClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#handleClick);
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => node instanceof MenuElement)
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded") {
      const bool = (value != null);
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      this.shadowRoot.querySelector("button").setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if (item.hasSubmenu) item.expanded = false;
        })
      }

    }
  }

}
