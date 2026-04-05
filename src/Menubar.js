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

  #pointerDown

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
      const value = (menu === targetMenu);
      if (menu.active !== value) menu.active = value;
      
      const expandedValue = (menu == targetMenu) ? expanded : false;
      if (menu.expanded !== expandedValue) menu.expanded = expandedValue;
    }
  }

  showMenu(targetMenu) {
    for (const menu of this.menus) {
      const value = (menu === targetMenu);
      if (menu.active !== value) menu.active = value;
      if (menu.expanded !== value) menu.expanded = value;
    }
    // always keep one menu focusable
    if (!targetMenu) this.menus[0].focusable = true;
  }

  close() {
    this.showMenu(null);
  }

  #getTargetMenu(node) {
    if (!node) return null;
    else if (node instanceof MenubarItem) return node;
    else if (node.assignedSlot?.parentNode?.role !== "menuitem") return null;

    return this.#getTargetMenu(node.parentNode);
  }

  #handleClick = e => {
    if (this.contains(e.target)) {
      const menu = this.#getTargetMenu(e.target);
      if (menu) this.showMenu(this.menuActive?.expanded ? null : menu);
    } else this.showMenu(null);
  }

  #handlePointerOver = e => {
    if (this.menuActive) {
      const menu = this.#getTargetMenu(e.target);
      if (menu) this.activeMenu(menu);
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
    if (!this.#pointerDown && !this.contains(e.relatedTarget)) {
      if (!this.menuActive) {
        const menu = this.#getTargetMenu(e.target);
        menu.active = true;
      }
    }
  }

  #handleFocusOut = e => {
    if (!this.#pointerDown && !this.contains(e.relatedTarget)) {
      this.menus.forEach(menu => {
        if (menu.expanded) menu.expanded = false;
      })
    }
  }

  #handlePointerDown = () => {
    this.#pointerDown = true;
  }

  #handlePointerUp = () => {
    this.#pointerDown = false;
  }

  connectedCallback() {
    document.addEventListener("click", this.#handleClick);
    
    this.addEventListener("pointerover", this.#handlePointerOver);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("pointerdown", this.#handlePointerDown);
    this.addEventListener("pointerup", this.#handlePointerUp);
    this.addEventListener("focusin",this.#handleFocusIn);
    this.addEventListener("focusout",this.#handleFocusOut);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#handleClick);
  }
}

customElements.define("desktop-menubar", MenuBar);
