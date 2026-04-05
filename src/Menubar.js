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
    let expanded = Boolean(this.menuActive?.expanded);
    for (const menu of this.menus) {
      menu.active = (menu === targetMenu);
      menu.expanded = (menu == targetMenu) ? expanded : false;
    }
  }

  showMenu(targetMenu) {
    for (const menu of this.menus) {
      menu.expanded = menu.active = (menu === targetMenu);
    }
    // always keep one menu focusable
    if (!targetMenu) this.menus[0].focusable = true;
  }

  close() {
    this.showMenu(null);
  }

  #handleClick = e => {
    if (!this.contains(e.target)) this.showMenu(null);
    else if (this.menus.includes(e.target)) {
      this.showMenu(this.menuActive?.expanded ? null : e.target);
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
          this.activeMenu(menuActive);
        }
        break;
      case "Enter": case "ArrowDown":
        if (!menuActive.expanded) {
          e.stopPropagation();
          this.showMenu(menuActive);
          menuActive.querySelector("desktop-menu").activeItem(0);
        }
    }
  }

  #handleFocusIn = e => {
    if (!this.contains(e.relatedTarget)) {
      if (!this.menus.some(menu => menu.active)) {
        this.menus[0].active = true;
      }
    }
  }

  #handleFocusOut = e => {
    if (!this.contains(e.relatedTarget)) {
      this.menus.forEach(menu => {
        if (menu.expanded) menu.expanded = false;
      })
    }
  }

  connectedCallback() {
    document.addEventListener("click", this.#handleClick);
    document.addEventListener("pointerover", this.#handlePointerOver);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focusin",this.#handleFocusIn);
    this.addEventListener("focusout",this.#handleFocusOut);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#handleClick);
    document.removeEventListener("pointerover", this.#handlePointerOver);
  }
}

customElements.define("desktop-menubar", MenuBar);
