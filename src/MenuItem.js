import MenuElement from "./MenuElement.js"

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  .arrow {
    font-size:0.6rem;
  }

  ::slotted(desktop-menu) {
    position:absolute;
    left:100%;
    top:0;
  }
`);

const template = document.createElement("template");
template.innerHTML = `
  <li role="none">
    <a role="menuitem" href="#">
      <span class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="label"></span>
      <span class="shortcut">
      </span>
    </a>
    <slot name="submenu" hidden></slot>
    <span class="arrow" hidden>▶</span>
  </li>
`

let idCpt = 0;

export default class MenuItem extends MenuElement {

  #root

  static observedAttributes = ["expanded", "active"];

  constructor() {
    super();
    this.#root = this.shadowRoot;
    this.#root.adoptedStyleSheets.push(style);
    this.#root.append(template.content.cloneNode(true));
  }

  get label() {
    return this.getAttribute("label");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get expanded() {
    const attr = this.#root.querySelector("a").getAttribute("aria-expanded");
    return attr === "true";
  }

  set expanded(bool) {
    if (typeof bool !== "boolean") throw new TypeError("expanded value must be a boolean");

    this.#root.querySelector("slot[name=submenu]").hidden = !bool;
    this.#root.querySelector("a").setAttribute("aria-expanded", String(bool));

    if (!bool) {
      this.querySelectorAll("desktop-menu-item").forEach(item => {
        item.active = false;
        item.expanded = false;
      })
    }
  }

  get shortcut() {
    return this.getAttribute("shortcut");
  }

  get hasSubmenu() {
    return Boolean(this.querySelector("[slot=submenu]"));
  }

  #isLastExpanded() {
    const subItems = this.querySelectorAll("desktop-menu-item");
    return subItems.length === 0 || [...subItems].every(item => !item.expanded);
  }

  #isShortcut(e) {
    let [meta, key] = this.shortcut.toLowerCase().split(/\s*\+\s*/);

    if (meta === "ctrl" && !e.metaKey && !e.ctrlKey) return false;
    if (meta === "shift" && !e.shiftKey) return false;

    if (key == null) key = meta;
    
    return key === e.key.toLowerCase();
  }

  #handleKeyShortcut = e => {
    if (!this.disabled && this.#isShortcut(e)) {
      e.preventDefault();
      this.#root.querySelector("a").click();
    }
  }

  #handleKeyNavigation = e => {
    if (!this.disabled && !this.active || this.assignedSlot?.hidden || !this.hasSubmenu || !this.#isLastExpanded()) return;

    switch (e.key) {

      case "ArrowLeft": case "Escape":
        this.expanded = false;
        this.active = true;
        break;

      case "ArrowRight": case "Enter": case " ":
        if (!this.expanded) {
          this.expanded = true;
          this.querySelector("desktop-menu").activeItem(0);
        }
        break;
    }
  }

  connectedCallback() {
    this.#root.querySelector(".label").textContent = this.label;
    const a = this.#root.querySelector("a");

    a.addEventListener("click", e => {
      e.preventDefault();
      if (!this.disabled) {
        this.dispatchEvent(new CustomEvent("select", { detail : { originalEvent : e } }));
      }
    });

    if (this.hasSubmenu) {
      const li = this.#root.querySelector("li");
      li.querySelector(".arrow").hidden = false;

      a.setAttribute("aria-haspopup", "true");
      a.setAttribute("aria-expanded", "false");

      document.addEventListener("keydown", this.#handleKeyNavigation);
    }

    if (this.shortcut) {
      this.#root.querySelector(".shortcut").textContent = this.shortcut;
      document.addEventListener("keydown", this.#handleKeyShortcut);
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#handleKeyNavigation);
    document.removeEventListener("keydown", this.#handleKeyShortcut);
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded" && this.hasSubmenu) {
      this.expanded = (value != null);
    } else if (prop === "active") {
      if (value != null) this.#root.querySelector("a").focus();
    }
  }

}

customElements.define("desktop-menu-item", MenuItem);