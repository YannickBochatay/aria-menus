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
  <ul role="menubar" tabindex="0">
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

  #handleKeyDown = e => {
    if (!this.menuActive) return;

    const menus = this.menus;
    const menuActive = this.menuActive;
    const currentIndex = menus.indexOf(menuActive);

    if (currentIndex === -1) return;

    let newMenu

    switch (e.key) {
      case "ArrowLeft":
        newMenu = (currentIndex === 0) ? menus.at(-1) : menus[currentIndex - 1]
        this.activeMenu(newMenu);
        break;
      case "ArrowRight":
        newMenu = currentIndex === menus.length - 1 ? menus[0] : menus[currentIndex + 1]
        this.activeMenu(newMenu);
        break;
      case "Escape":
        if (menuActive.expanded) {
          this.close();
          menuActive.active = true;
        }
        break;
      case "Enter": case "ArrowDown":
        if (!menuActive.expanded) {
          this.showMenu(menuActive);
          menuActive.querySelector("desktop-menu").activeItem(0);
        }
    }
  }

  connectedCallback() {
    document.addEventListener("click", this.#handleClick);
    document.addEventListener("pointerover", this.#handlePointerOver);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focus", () => {
      this.shadowRoot.querySelector("ul").tabIndex = -1;
      let menu = this.menuActive ?? this.menus[0];
      menu.active = true;
    })
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#handleClick);
    document.removeEventListener("pointerover", this.#handlePointerOver);
    this.removeEventListener("keydown", this.#handleKeyDown);
  }
}

customElements.define("desktop-menubar", MenuBar);
