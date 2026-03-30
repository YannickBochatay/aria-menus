import MenuItem from "./MenuItem.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/ `
  :host {
    display:inline-block;
  }
  ul {
    display : inline-block;
    position : relative;
    background-color : white;
    border : 1px solid gray;
    border-radius : 2;
    box-shadow : 2px 1px 1px gray;
    list-style : none;
    padding : 3px 0px;
    margin : 0;
    line-height : normal;
  }
`);

const template = document.createElement("template");
template.innerHTML = `
  <ul role="menu" aria-label="">
    <slot></slot>
  </ul>
`

export default class DesktopMenu extends HTMLElement {

  #root
  #timeoutId

  constructor() {
    super()
    this.#root = this.attachShadow({ mode : "open" });
    this.#root.adoptedStyleSheets = [style];
    this.#root.append(template.content.cloneNode(true));
  }

  #handleKeyDown = e => {
    if (this.assignedSlot?.hidden || this.items.some(item => item.expanded)) return;
    
    const activeIndex = this.items.findIndex(item => item.active);
    let newIndex = null;

    switch (e.key) {

      case "ArrowUp":
        newIndex = (activeIndex === -1) ? this.items.length - 1 : activeIndex - 1;
        break;

      case "ArrowDown":
        newIndex = (activeIndex === -1) ? 0 : activeIndex + 1;
        break;

      case "Home":
        newIndex = 0;
        break;
      
      case "End":
        newIndex = this.items.length - 1;
        break;

      default:
        if (e.key.length === 1) {
          newIndex = this.items.findIndex(item => (
            item.label.slice(0,1).toLowerCase() === e.key
          ));
          if (newIndex === -1) newIndex = null;
        }
    }

    if (newIndex != null) this.activeItem(newIndex);
  }

  get items() {
    return Array.from(this.children).filter(item => item instanceof MenuItem && !item.disabled);
  }

  activeItem(index) {
    const items = this.items;
    if (index > items.length - 1) index = 0;
    else if (index < 0) index = items.length - 1;

    for (const [ind, item] of items.entries()) {
      if (index === ind) item.active = true;
      else {
        item.expanded = false;
        item.active = false;
      }
    }
  }

  connectedCallback() {
    this.#root.addEventListener("pointerover", e => {

      if (e.target.tagName.toLowerCase() !== "desktop-menu-item") return;

      for (const [ind, item] of this.items.entries()) {
        if (e.target === item) {
          this.activeItem(ind);
          clearTimeout(this.#timeoutId);
          this.#timeoutId = setTimeout(() => item.expanded = true, 300);
          break;
        }
      }

    });

    document.addEventListener("keydown", this.#handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#handleKeyDown);
  }

}

customElements.define("desktop-menu", DesktopMenu);