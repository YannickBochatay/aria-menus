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

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  get menus() {
    return Array.from(this.children).filter(menu => (menu instanceof MenubarItem) && !menu.disabled);
  }

  get menuActive() {
    return this.menus.find(menu => menu.active);
  }

  activeMenu(targetMenu) {
    let expanded = this.menuActive?.expanded;
    for (const menu of this.menus) {
      menu.active = (menu === targetMenu);
      menu.expanded = (menu == targetMenu) ? expanded : false;
    }
  }

  showMenu(targetMenu) {
    for (const menu of this.menus) {
      menu.expanded = menu.active = (menu === targetMenu);
    }
  }

  close() {
    this.showMenu(null);
  }

  #handleClick = e => {
    if (!this.contains(e.target) || this.menuActive === e.target) {
      this.showMenu(null);
    } else if (this.menus.includes(e.target)) {
      this.showMenu(this.menuActive ? null : e.target);
    }
  }

  #handlePointerOver = e => {
    if (this.menuActive && this.menus.includes(e.target)) this.activeMenu(e.target);
  }

  #isLastExpanded() {
    const subItems = this.querySelectorAll("desktop-menu-item");
    return subItems.length === 0 || [...subItems].every(item => !item.expanded);
  }

  #handleKeyDown = e => {
    if (!this.menuActive || !this.#isLastExpanded()) return;

    const menus = this.menus;
    const menuActive = this.menuActive;
    const currentIndex = menus.indexOf(menuActive);

    if (currentIndex === -1) return;

    switch (e.key) {
      case "ArrowLeft":
        this.activeMenu(currentIndex === 0 ? menus.at(-1) : menus[currentIndex - 1]);
        break;
      case "ArrowRight":
        this.activeMenu(currentIndex === menus.length - 1 ? menus[0] : menus[currentIndex + 1]);
        break;
      case "Escape":
        if (menuActive.expanded) {
          this.close();
          menus[currentIndex].active = true;
        }
        break;
      case "Enter":
        if (!menuActive.expanded) {
          this.showMenu(menus[currentIndex]);
          menuActive.querySelector("desktop-menu").activeItem(0);
        }
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
