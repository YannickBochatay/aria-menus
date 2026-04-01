import MenubarItem from "./MenubarItem.js"

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  ul {
    list-style:none;
    margin:0;
    padding:0;
    display:flex;
  }
}`);

const template = document.createElement("template");

template.innerHTML = `
  <ul role="menubar">
    <slot></slot>
  </ul>
`;

export default class MenuBar extends HTMLElement {

  #active = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  get menus() {
    return Array.from(this.children).filter(menu => (menu instanceof MenubarItem) && !menu.disabled);
  }

  selectMenu(targetMenu) {
    for (const menu of this.menus) {
      menu.expanded = (menu === targetMenu);
      menu.active = (menu === targetMenu);
    }
  }

  close() {
    this.selectMenu(null);
  }

  #handleClick = e => {
    if (!this.contains(e.target)) {
      this.selectMenu(null);
      this.#active = false;
    } else if (this.menus.includes(e.target)) {
      this.#active = !this.#active;
      this.selectMenu(this.#active ? e.target : null);
    }
  }

  #handlePointerOver = e => {
    if (this.#active && this.menus.includes(e.target)) this.selectMenu(e.target);
  }

  #isLastExpanded() {
    const subItems = this.querySelectorAll("desktop-menu-item");
    return subItems.length === 0 || [...subItems].every(item => !item.expanded);
  }

  #handleKeyDown = e => {
    if (!this.#active || !this.#isLastExpanded()) return;

    const menus = this.menus;
    const currentIndex = menus.findIndex(menu => menu.expanded);

    if (currentIndex === -1) return;

    switch (e.key) {
      case "ArrowLeft":
        this.selectMenu(currentIndex === 0 ? menus.at(-1) : menus[currentIndex - 1]);
        break;
      case "ArrowRight":
        this.selectMenu(currentIndex === menus.length - 1 ? menus[0] : menus[currentIndex + 1])
        break;
      case "Escape":
        this.close();
        break;
    }
  }

  connectedCallback() {
    document.addEventListener("click", this.#handleClick);
    document.addEventListener("pointerover", this.#handlePointerOver);
    document.addEventListener("keydown", this.#handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#handleClick);
    document.removeEventListener("pointerover", this.#handlePointerOver);
    document.removeEventListener("keydown", this.#handleKeyDown);
  }
}

customElements.define("desktop-menubar", MenuBar);
