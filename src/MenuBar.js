import MenuElement from "./MenuElement.js"

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  ul {
    list-style:none;
    margin:0;
    padding:0;
    display:flex;
  }
  :host([direction=column]) ul {
    display:block;
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

  #getAllMenus() {
    return Array.from(this.children).filter(menu => (menu instanceof MenuElement));
  }

  get menus() {
    return this.#getAllMenus().filter(menu => !menu.disabled);
  }

  get menuActive() {
    return this.menus.find(menu => menu.active);
  }

  activeMenu(targetMenu) {
    let expanded = Boolean(this.menuActive?.expanded);

    for (const menu of this.menus) {
      const value = (menu === targetMenu)
      menu.active = value;
      menu.focusable = value;
      if ("expanded" in menu) menu.expanded = value ? expanded : false;
    }
    // always keep one menu focusable
    if (!targetMenu) this.menus[0].focusable = true;
  }

  showMenu(targetMenu) {
    this.activeMenu(targetMenu);
    if (targetMenu && "expanded" in targetMenu) this.menuActive.expanded = true;
  }

  close() {
    this.showMenu(null);
  }

  #getTargetMenu(node) {
    if (!node || node === this) return null;
    else if (node instanceof MenuElement) {
      return Array.from(this.children).includes(node) ? node : null;
    }
    
    return this.#getTargetMenu(node.parentNode);
  }

  #handlePointerOver = e => {
    if (this.menuActive) {
      const menu = this.#getTargetMenu(e.target);
      if (menu && !menu.disabled) this.activeMenu(menu);
    }
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
        if (menus.length > 1) {
          newMenu = (currentIndex === 0) ? menus.at(-1) : menus[currentIndex - 1]
          this.activeMenu(newMenu);
        }
        break;
      case "ArrowRight":
        if (menus.length > 1) {
          newMenu = currentIndex === menus.length - 1 ? menus[0] : menus[currentIndex + 1]
          this.activeMenu(newMenu);
        }
        break;
      case "Escape":
        if (menuActive.expanded) {
          this.close();
          this.activeMenu(menuActive);
        }
        break;
    }
  }

  #handleFocusIn = e => {
    if (this.menus.includes(document.activeElement)) {
      document.activeElement.active = true;
    }
  }

  closeMenus() {
    this.menus.forEach(menu => {
      if (menu.expanded) menu.expanded = false;
    });
  }

  #handleFocusOut = e => {
    if (!this.contains(e.relatedTarget)) this.closeMenus();
  }

  #handleClick = e => {
    if (this.menus.includes(e.target) && "expanded" in e.target) {
      e.target.expanded = !e.target.expanded;
    }
  }

  connectedCallback() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("pointerover", this.#handlePointerOver);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focusin", this.#handleFocusIn);
    this.addEventListener("focusout", this.#handleFocusOut);

    this.#getAllMenus().forEach(menu => menu.direction = "column");

    if (this.menus.every(menu => !menu.focusable)) this.menus[0].focusable = true;
  }
}
