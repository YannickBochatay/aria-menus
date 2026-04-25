// src/MenuElement.js
var style = new CSSStyleSheet();
style.replaceSync(
  /*css*/
  `
  :host {
    --bg-color:rgb(213, 220, 238);
    --icon-width:1rem;
    --icon-margin:0 0.4rem 0 0;
    --margin-left:1.4rem;
  }
  :host([active]) li {
    background-color:var(--bg-color);
  }
  :host([disabled]) li {
    background-color:unset;
    .label {
      opacity:0.7;
      font-style:italic;
      cursor:not-allowed;
    }
  }
  :host([nocaret]) [role=menuitem].hasSubmenu::after {
    content:"";
    display:none;
  }
  li {
    padding:0.2rem 0.3rem;
    margin:0;
    position:relative;
    box-sizing:border-box;
    display:flex;
    align-items:center;
    cursor:default;
    &:hover {
      background-color:var(--bg-color);
    }
    [role^=menuitem] {
      display:flex;
      align-items:center;
      color:inherit;
      flex:1;
    }
    ::slotted(a) {
      color:inherit;
    }
    .icon {
      width:var(--icon-width);
      margin:var(--icon-margin);
      display:inline-block;
    }
    ::slotted([slot=icon]) {
      width:var(--icon-width);
      vertical-align:middle;
    }
    .label {
      white-space:nowrap;
      flex:1;
    }
    .info {
      opacity:0.7;
      font-size:0.9rem;
      margin-left:var(--margin-left);
    }
  }
  :host([direction=column]) li {
    padding:0.3rem 1rem;
    
    .icon:has(slot:empty) {
      width:auto;
      margin:0;
    }
    .info:has(slot:empty) {
      margin-left:0;
    }
  }
  ::slotted([slot=menu]) {
    z-index:1;
  }
`
);
var labelTemplate = `
  <span aria-hidden="true" class="icon">
    <slot name="icon"></slot>
  </span>
  <span class="label">
    <slot></slot>
  </span>
  <span class="info">
    <slot name="info"></slot>
  </span>
`;
var MenuElement = class extends HTMLElement {
  static observedAttributes = ["active", "info", "focusable"];
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [style];
  }
  get direction() {
    return this.getAttribute("direction");
  }
  set direction(value) {
    if (["column", "row"].includes(value)) {
      this.setAttribute("direction", value);
    } else {
      throw new Error("direction value must be column or row");
    }
  }
  get info() {
    return this.getAttribute("info");
  }
  set info(value) {
    if (typeof value !== "string") throw new TypeError("info must be a string");
    this.setAttribute("info", value);
  }
  get active() {
    return this.hasAttribute("active");
  }
  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }
  get focusable() {
    return this.hasAttribute("focusable");
  }
  set focusable(value) {
    if (value) this.setAttribute("focusable", "");
    else this.removeAttribute("focusable");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  #getSlotLabel() {
    return this.shadowRoot.querySelector("slot:not([name])");
  }
  get label() {
    const slottedNodes = [...this.#getSlotLabel().assignedNodes()];
    return slottedNodes.reduce((label, elmt) => label + elmt.textContent.trim(), "");
  }
  connectedCallback() {
    const slottedLabel = this.querySelector("[slot=label]");
    if (slottedLabel) {
      slottedLabel.removeAttribute("slot");
      this.#getSlotLabel().assign(slottedLabel);
    }
  }
  attributeChangedCallback(prop, prevValue, value) {
    const menuItem = this.shadowRoot.querySelector("[role^=menuitem]");
    if (prop === "active") {
      if (value != null) menuItem.focus();
    } else if (prop === "info") {
      const node = this.shadowRoot.querySelector(".info");
      if (node) node.textContent = value;
    } else if (prop === "focusable") {
      menuItem.tabIndex = value == null ? -1 : 0;
    }
  }
};

// src/MenuList.js
var style2 = new CSSStyleSheet();
style2.replaceSync(
  /*css*/
  `
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
`
);
var template = document.createElement("template");
template.innerHTML = `
  <ul role="menu" aria-label="">
    <slot></slot>
  </ul>
`;
var MenuList = class extends HTMLElement {
  #timeoutId;
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [style2];
    root.append(template.content.cloneNode(true));
  }
  #handleKeyDown = (e) => {
    if (this.items.some((item) => item.expanded)) return;
    const activeIndex = this.items.findIndex((item) => item.active);
    let newIndex = null;
    switch (e.key) {
      case "ArrowUp":
        newIndex = activeIndex === -1 ? this.items.length - 1 : activeIndex - 1;
        break;
      case "ArrowDown":
        newIndex = activeIndex === -1 ? 0 : activeIndex + 1;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = this.items.length - 1;
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          newIndex = this.items.findIndex((item) => item.label.slice(0, 1).toLowerCase() === e.key);
          if (newIndex === -1) newIndex = null;
        }
    }
    if (newIndex != null) {
      e.preventDefault();
      e.stopPropagation();
      this.activeItem(newIndex);
    }
  };
  get items() {
    return Array.from(this.children).filter((item) => item instanceof MenuElement && !item.disabled);
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
  #handleFocusIn = (e) => {
    if (this.items.includes(document.activeElement)) {
      document.activeElement.active = true;
    }
  };
  #handleFocusOut = (e) => {
    if (!this.contains(e.relatedTarget)) this.closeSubmenus();
  };
  connectedCallback() {
    this.shadowRoot.addEventListener("pointerover", (e) => {
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
    if (this.items.every((item) => !item.focusable)) this.items[0].focusable = true;
  }
};

// src/MenuItem.js
var style3 = new CSSStyleSheet();
style3.replaceSync(
  /*css*/
  `
  [role=menuitem].hasSubmenu::after {
    content:"\u25B6";
    font-size:0.6rem;
    margin-left:var(--margin-left);
    margin-right:0.2rem;
    cursor:default;
  }
  :host([direction=column]) li {
    [role=menuitem].hasSubmenu::after {
      transform:rotate(90deg);
    }
    slot[name=menu]::slotted(*) {
      position:absolute;
      top:100%;
      margin-left:-1em;
    }
  }
  :host([direction=column][expanded]) {
    [role=menuitem].hasSubmenu::after {
      transform:rotate(-90deg);
    }
  }
  :host([direction=row]) {
    slot[name=menu]::slotted(*) {
      position:absolute;
      left:100%;
      top:0;
    }
  }
    
`
);
var template2 = document.createElement("template");
template2.innerHTML = `
  <li role="none">
    <span role="menuitem" tabindex="-1" aria-haspopup="true" aria-expanded="false">
      ${labelTemplate}
    </span>
    <slot name="menu" hidden></slot>
  </li>
`;
var MenuItem = class extends MenuElement {
  static observedAttributes = [...MenuElement.observedAttributes, "expanded"];
  constructor() {
    super();
    this.shadowRoot.append(template2.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets.push(style3);
  }
  get hasSubmenu() {
    return Boolean(this.shadowRoot.querySelector("slot[name=menu]").assignedNodes().length);
  }
  get expanded() {
    return this.hasSubmenu && this.hasAttribute("expanded");
  }
  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }
  #findMenuList() {
    return [...this.children].find((child) => child instanceof MenuList);
  }
  #handleSubmenuKeyNavigation(e) {
    const expandKey = this.direction === "column" ? "ArrowDown" : "ArrowRight";
    const hideKey = this.direction === "column" ? null : "ArrowLeft";
    switch (e.key) {
      case hideKey:
      case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
          this.active = true;
        }
        break;
      case expandKey:
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!this.expanded) {
          e.stopPropagation();
          this.expanded = true;
        }
        const list = this.#findMenuList();
        if (!list.items.some((item) => item.active)) list.activeItem(0);
        break;
      }
    }
  }
  #handleSimpleItemKeyNavigation(e) {
    switch (e.key) {
      case "Enter":
      case " ": {
        const link = this.querySelector("a");
        if (link) this.querySelector("a")?.click();
        else this.dispatchEvent(new Event("click", { target: this }));
        break;
      }
    }
  }
  #handleKeyNavigation = (e) => {
    if (this.disabled) return;
    this.hasSubmenu ? this.#handleSubmenuKeyNavigation(e) : this.#handleSimpleItemKeyNavigation(e);
  };
  connectedCallback() {
    this.addEventListener("keydown", this.#handleKeyNavigation);
    if (!this.hasAttribute("direction")) this.direction = "row";
    const menuSlot = this.shadowRoot.querySelector("slot[name=menu]");
    menuSlot.addEventListener("slotchange", () => {
      const menuItem = this.shadowRoot.querySelector("[role=menuitem]");
      const method = menuSlot.assignedNodes().length ? "add" : "remove";
      menuItem.classList[method]("hasSubmenu");
    });
    const link = this.querySelector("a");
    if (link && !link.hasAttribute("tabindex")) link.tabIndex = -1;
  }
  #findAllItems() {
    return [...this.querySelectorAll("*")].filter((node) => node instanceof MenuElement);
  }
  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);
    if (prop === "expanded" && this.hasSubmenu) {
      const bool = value != null;
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      this.shadowRoot.querySelector("[role=menuitem]").setAttribute("aria-expanded", String(bool));
      if (!bool) {
        this.#findAllItems().forEach((item) => {
          item.active = false;
          if ("expanded" in item) item.expanded = false;
        });
      }
    }
  }
};

// src/MenuInput.js
var template3 = document.createElement("template");
template3.innerHTML = `
  <li role="none">
    <span role="menuitemcheckbox" aria-checked="false" tabindex="-1">
      ${labelTemplate}
    </span>
  </li>
`;
var MenuInput = class extends MenuElement {
  static observedAttributes = [...MenuElement.observedAttributes, "disabled", "checked"];
  #menuitem;
  constructor() {
    super();
    this.shadowRoot.append(template3.content.cloneNode(true));
    this.#menuitem = this.shadowRoot.querySelector("[role^=menuitem]");
  }
  get value() {
    return this.getAttribute("value") || this.label;
  }
  get name() {
    return this.getAttribute("name");
  }
  set name(value) {
    this.setAttribute("name", value);
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    if (value) this.setAttribute("checked", "");
    else this.removeAttribute("checked");
  }
  click = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event("change", { target: this }));
  };
  #handleKeyDown = (e) => {
    if (this.active && e.key === "Enter" || e.key === " ") {
      if (!this.disabled) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.click();
    }
  };
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.click);
    this.addEventListener("keydown", this.#handleKeyDown);
  }
  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(prop, prevValue, value);
    if (prop === "checked") {
      this.#menuitem.setAttribute("aria-checked", value == null ? "false" : "true");
    }
  }
};

// src/MenuRadio.js
var style4 = new CSSStyleSheet();
style4.replaceSync(
  /*css*/
  `
  [aria-checked=true] .icon::before {
    content:"\u25CF";
  }
`
);
var MenuRadio = class extends MenuInput {
  constructor() {
    super();
    this.shadowRoot.querySelector("[role^=menuitem]").setAttribute("role", "menuitemradio");
    this.shadowRoot.adoptedStyleSheets.push(style4);
  }
  #uncheckOthers() {
    if (this.name) {
      this.parentNode.querySelectorAll(`[name="${this.name}"]`).forEach((item) => {
        if (item !== this) item.checked = false;
      });
    } else {
      ["previous", "next"].forEach((pos) => {
        const prop = pos + "ElementSibling";
        let item = this[prop];
        while (item instanceof this.constructor) {
          item.checked = false;
          item = item[prop];
        }
      });
    }
  }
  attributeChangedCallback(prop, oldValue, value) {
    super.attributeChangedCallback(...arguments);
    if (prop === "checked" && value != null) this.#uncheckOthers();
  }
};

// src/MenuCheckbox.js
var style5 = new CSSStyleSheet();
style5.replaceSync(
  /*css*/
  `
  [aria-checked=true] .icon::before {
    content:"\u2713";
  }
`
);
var MenuCheckbox = class extends MenuInput {
  constructor() {
    super();
    this.shadowRoot.querySelector("[role^=menuitem]").setAttribute("role", "menuitemcheckbox");
    this.shadowRoot.adoptedStyleSheets.push(style5);
  }
};

// src/MenuButton.js
var style6 = new CSSStyleSheet();
style6.replaceSync(
  /*css*/
  `
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
    content:"\u25B6";
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
`
);
var template4 = document.createElement("template");
template4.innerHTML = `
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
`;
var MenuButton = class extends HTMLElement {
  static observedAttributes = ["expanded"];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template4.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [style6];
  }
  get expanded() {
    return this.hasAttribute("expanded");
  }
  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }
  #findMenuList() {
    return [...this.children].find((child) => child instanceof MenuList);
  }
  #handleKeyNavigation = (e) => {
    switch (e.key) {
      case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
          this.shadowRoot.querySelector("button").focus();
        }
        break;
      case "ArrowDown":
      case "Enter":
      case " ": {
        const list = this.#findMenuList();
        const hasMenuActive = list.items.some((item) => item.active);
        if (!this.expanded || !hasMenuActive) {
          e.preventDefault();
          e.stopPropagation();
          if (!this.expanded) this.expanded = true;
          list.activeItem(0);
        }
        break;
      }
    }
  };
  #handleClick = (e) => {
    const button = this.shadowRoot.querySelector("button");
    const slot = button.querySelector("slot");
    if (e.target === this || e.target === button || e.target.assignedSlot === slot) {
      this.expanded = !this.expanded;
    }
  };
  #handleFocusOut = (e) => {
    if (!this.contains(e.relatedTarget)) this.expanded = false;
  };
  connectedCallback() {
    this.addEventListener("keydown", this.#handleKeyNavigation);
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("focusout", this.#handleFocusOut);
  }
  #findAllItems() {
    return [...this.querySelectorAll("*")].filter((node) => node instanceof MenuElement);
  }
  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded") {
      const bool = value != null;
      const button = this.shadowRoot.querySelector("button");
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      button.setAttribute("aria-expanded", String(bool));
      if (!bool) {
        this.#findAllItems().forEach((item) => {
          item.active = false;
          if ("expanded" in item) item.expanded = false;
        });
      }
    }
  }
};

// src/MenuSeparator.js
var style7 = new CSSStyleSheet();
style7.replaceSync(
  /*css*/
  `
  li {
    border-bottom:1px solid #ccc;
    width:100%;
  }
`
);
var template5 = document.createElement("template");
template5.innerHTML = `
  <li role="separator"></li>
`;
var MenuSeparator = class extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [style7];
    root.append(template5.content.cloneNode(true));
  }
};

// src/MenuBar.js
var style8 = new CSSStyleSheet();
style8.replaceSync(
  /*css*/
  `
  ul {
    list-style:none;
    margin:0;
    padding:0;
    display:flex;
  }
  :host([direction=column]) ul {
    display:block;
  }
}`
);
var template6 = document.createElement("template");
template6.innerHTML = `
  <ul role="menubar">
    <slot></slot>
  </ul>
`;
var MenuBar = class extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [style8];
    root.append(template6.content.cloneNode(true));
  }
  #getAllMenus() {
    return Array.from(this.children).filter((menu) => menu instanceof MenuElement);
  }
  get menus() {
    return this.#getAllMenus().filter((menu) => !menu.disabled);
  }
  get menuActive() {
    return this.menus.find((menu) => menu.active);
  }
  activeMenu(targetMenu) {
    let expanded = Boolean(this.menuActive?.expanded);
    for (const menu of this.menus) {
      const value = menu === targetMenu;
      menu.active = value;
      menu.focusable = value;
      if ("expanded" in menu) menu.expanded = value ? expanded : false;
    }
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
  #handlePointerOver = (e) => {
    if (this.menuActive) {
      const menu = this.#getTargetMenu(e.target);
      if (menu && !menu.disabled) this.activeMenu(menu);
    }
  };
  #handleKeyDown = (e) => {
    if (!this.menuActive) return;
    const menus = this.menus;
    const menuActive = this.menuActive;
    const currentIndex = menus.indexOf(menuActive);
    if (currentIndex === -1) return;
    let newMenu;
    switch (e.key) {
      case "ArrowLeft":
        if (menus.length > 1) {
          newMenu = currentIndex === 0 ? menus.at(-1) : menus[currentIndex - 1];
          this.activeMenu(newMenu);
        }
        break;
      case "ArrowRight":
        if (menus.length > 1) {
          newMenu = currentIndex === menus.length - 1 ? menus[0] : menus[currentIndex + 1];
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
  };
  #handleFocusIn = (e) => {
    if (this.menus.includes(document.activeElement)) {
      document.activeElement.active = true;
    }
  };
  closeMenus() {
    this.menus.forEach((menu) => {
      if (menu.expanded) menu.expanded = false;
    });
  }
  #handleFocusOut = (e) => {
    if (!this.contains(e.relatedTarget)) this.closeMenus();
  };
  #handleClick = (e) => {
    if (this.menus.includes(e.target) && "expanded" in e.target) {
      e.target.expanded = !e.target.expanded;
    }
  };
  connectedCallback() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("pointerover", this.#handlePointerOver);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focusin", this.#handleFocusIn);
    this.addEventListener("focusout", this.#handleFocusOut);
    this.#getAllMenus().forEach((menu) => menu.direction = "column");
    if (this.menus.every((menu) => !menu.focusable)) this.menus[0].focusable = true;
  }
};

// src/MenuContext.js
var template7 = document.createElement("template");
template7.innerHTML = `
  <style>
  :host {
    display:none;
    position:fixed;
  }
  </style>
  <slot></slot>
`;
var MenuContext = class extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template7.content.cloneNode(true));
  }
  get target() {
    return document.querySelector("#" + this.getAttribute("for"));
  }
  close() {
    this.firstElementChild?.closeSubmenus?.();
    this.style.display = "none";
    this.setAttribute("aria-expanded", false);
    this.target.focus();
  }
  open(e) {
    this.style.display = "inline-block";
    const { x, y } = this.#computePosition(e);
    this.style.left = x + "px";
    this.style.top = y + "px";
    this.setAttribute("aria-expanded", true);
    this.firstElementChild.focus();
  }
  #handleFocusOut = (e) => {
    if (!this.contains(e.relatedTarget)) this.close();
  };
  #computePosition(e) {
    const rect = this.getBoundingClientRect();
    const clientX = e?.clientX ?? rect.left;
    const clientY = e?.clientY ?? rect.top;
    let x = clientX;
    let y = clientY;
    if (clientX + rect.width > window.innerWidth) {
      x -= rect.width;
      if (x < 0) x = window.innerWidth - rect.width;
    }
    if (clientY + rect.height > window.innerHeight) {
      y -= rect.height;
      if (y < 0) y = window.innerHeight - rect.height;
    }
    return { x, y };
  }
  #handleContextMenu = (e) => {
    e.preventDefault();
    this.open(e);
  };
  #handleKeyDown = (e) => {
    if (e.key === "Escape") this.close();
  };
  connectedCallback() {
    this.target.setAttribute("aria-haspopup", "menu");
    this.target.addEventListener("contextmenu", this.#handleContextMenu);
    this.addEventListener("keydown", this.#handleKeyDown);
    this.addEventListener("focusout", this.#handleFocusOut);
    this.firstElementChild.tabIndex = -1;
  }
  disconnectedCallback() {
    this.target.removeEventListener("contextmenu", this.#handleContextMenu);
    this.target.removeAttribute("aria-haspopup");
  }
};

// src/index.js
customElements.define("menu-item", MenuItem);
customElements.define("menu-item-checkbox", MenuCheckbox);
customElements.define("menu-item-radio", MenuRadio);
customElements.define("menu-button", MenuButton);
customElements.define("menu-separator", MenuSeparator);
customElements.define("menu-list", MenuList);
customElements.define("menu-bar", MenuBar);
customElements.define("menu-context", MenuContext);
export {
  MenuBar,
  MenuButton,
  MenuCheckbox,
  MenuContext,
  MenuItem,
  MenuList,
  MenuRadio,
  MenuSeparator
};
