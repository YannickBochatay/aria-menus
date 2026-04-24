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
    font-size:1rem;
    display:flex;
    align-items:center;
  }
  slot[name=menu]::slotted(*) {
    position:absolute;
    top:100%;
  }
  :host([nocaret]) slot:not([name])::after {
    content:"";
    display:none;
  }
  
  slot:not([name])::after {
    content:"▶";
    font-size:0.6rem;
    margin-left:0.5rem;
  }
  [aria-expanded=false] slot:not([name])::after {
    transform:rotate(90deg);
  }
  [aria-expanded=true] slot:not([name])::after {
    transform:rotate(-90deg);
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
    part="button"
  >
    <slot></slot>
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
          this.shadowRoot.querySelector("button").focus();
        }
        break;

      case "ArrowDown": case "Enter": case " ": {
        const list = this.#findMenuList();
        const hasMenuActive = list.items.some(item => item.active);

        if (!this.expanded || !hasMenuActive) {
          e.preventDefault();
          e.stopPropagation();
          if (!this.expanded) this.expanded = true;
          list.activeItem(0); 
        }
        break;
      }
    }
  }

  #handleClick = e => {
    const button = this.shadowRoot.querySelector("button")
    const slot = button.querySelector("slot")
    if (e.target === this || e.target === button || e.target.assignedSlot === slot) {
      this.expanded = !this.expanded
    }
  }

  #handleFocusOut = e => {
    if (!this.contains(e.relatedTarget)) this.expanded = false;
  }

  connectedCallback() {
    this.addEventListener("keydown", this.#handleKeyNavigation);
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("focusout", this.#handleFocusOut);
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => node instanceof MenuElement)
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded") {
      const bool = (value != null);
      const button = this.shadowRoot.querySelector("button");
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      button.setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if ("expanded" in item) item.expanded = false;
        });
      }

    }
  }

}
