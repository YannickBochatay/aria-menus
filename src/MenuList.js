import MenuElement from "./MenuElement.js";

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
    line-height:1.5;
  }
`);

const template = document.createElement("template");
template.innerHTML = `
  <ul role="menu" aria-label="">
    <slot></slot>
  </ul>
`

export default class MenuList extends HTMLElement {

  #timeoutId

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  #handleKeyDown = e => {
    if (this.items.some(item => item.expanded)) return;
    
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
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          newIndex = this.items.findIndex(item => (
            item.label.slice(0,1).toLowerCase() === e.key
          ));
          if (newIndex === -1) newIndex = null;
        }
    }

    if (newIndex != null) {
      e.preventDefault();
      e.stopPropagation();
      this.activeItem(newIndex);
    }
  }

  get items() {
    return Array.from(this.children).filter(item => (item instanceof MenuElement) && !item.disabled);
  }

  closeSubmenus() {
    for (const item of this.items) {
      if (item.expanded) item.expanded = false;
      item.active = false;
    }
  }

  activeItem(index) {
    const items = this.items;
    if (index > items.length - 1) index = 0;
    else if (index < 0) index = items.length - 1;

    for (const [ind, item] of items.entries()) {
      if (index === ind) {
        item.focusable = true;
        item.active = true;
      } else {
        if (item.expanded) item.expanded = false;
        item.active = false;
        item.focusable = false;
      }
    }
  }

  #handleFocusIn = e => {
    if (this.items.includes(document.activeElement)) {
      document.activeElement.active = true;
    }
  }

  #handleFocusOut = e => {
    if (!this.contains(e.relatedTarget)) this.closeSubmenus();
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("pointerover", e => {

      if (!(e.target instanceof MenuElement)) return;

      for (const [ind, item] of this.items.entries()) {
        if (e.target === item) {
          this.activeItem(ind);
          clearTimeout(this.#timeoutId);
          if ("expanded" in item) {
            this.#timeoutId = setTimeout(() => item.expanded = true, 300);
          }
          break;
        }
      }

    });

    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focusin", this.#handleFocusIn);
    this.addEventListener("focusout", this.#handleFocusOut);
    
    if (this.items.every(item => !item.focusable)) this.items[0].focusable = true;
  }
}
