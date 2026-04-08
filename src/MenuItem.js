import MenuCheckbox from "./MenuCheckbox.js";
import MenuElement from "./MenuElement.js"
import MenuList from "./Menu.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  .arrow {
    font-size:0.6rem;
  }

  slot[name=menu]::slotted(*) {
    position:absolute;
    left:100%;
    top:0;
  }
`);

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <a role="menuitem" href="#" class="focusedElmt" tabindex="-1">
      <span class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="label">
        <slot></slot>
      </span>
      <span class="shortcut">
      </span>
    </a>
    <slot name="menu" hidden></slot>
    <span class="arrow" hidden>▶</span>
  </li>
`

export default class MenuItem extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "expanded" ,"href"];

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets.push(style);
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  get shortcut() {
    return this.getAttribute("shortcut");
  }

  get hasSubmenu() {
    return Boolean(this.querySelector("[slot=menu]"));
  }

  get href() {
    return this.getAttribute("href");
  }

  set href(url) {
    this.setAttribute("href", url);
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  set expanded(value) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  #findMenuList() {
    return [...this.children].find(child => child instanceof MenuList);
  }

  #isShortcut(e) {
    let [meta, key] = this.shortcut.toLowerCase().split(/\s*\+\s*/);

    if (meta === "ctrl" && !e.metaKey && !e.ctrlKey) return false;
    if (meta === "shift" && !e.shiftKey) return false;
    if (meta === "alt" && !e.altKey) return false;

    if (key == null) key = meta;
    
    return key === e.key.toLowerCase();
  }

  #handleKeyShortcut = e => {
    if (!this.disabled && this.#isShortcut(e)) {
      this.shadowRoot.querySelector("a").click();
    }
  }

  #handleKeyNavigation = e => {
    switch (e.key) {

      case "ArrowLeft": case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
          this.active = true;
        }
        break;

      case "ArrowRight": case "Enter": case " ":
        if (!this.expanded) {
          e.stopPropagation();
          this.expanded = true;
          this.#findMenuList().activeItem(0);
        }
        break;
    }
  }

  connectedCallback() {
    const a = this.shadowRoot.querySelector("a");

    a.addEventListener("click", e => {
      if (!this.href) e.preventDefault();
      if (!this.disabled) {
        this.dispatchEvent(new CustomEvent("select", { detail : { originalEvent : e } }));
      }
    });

    if (this.hasSubmenu) {
      const li = this.shadowRoot.querySelector("li");
      li.querySelector(".arrow").hidden = false;

      a.setAttribute("aria-haspopup", "true");
      a.setAttribute("aria-expanded", "false");

      this.addEventListener("keydown", this.#handleKeyNavigation);
    }

    if (this.shortcut) {
      this.shadowRoot.querySelector(".shortcut").textContent = this.shortcut;
      document.addEventListener("keydown", this.#handleKeyShortcut);
    }
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.#handleKeyNavigation);
    document.removeEventListener("keydown", this.#handleKeyShortcut);
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => (
      node instanceof MenuItem || node instanceof MenuCheckbox
    ))
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);

    if (prop === "expanded" && this.hasSubmenu) {
      const bool = (value != null);
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      this.shadowRoot.querySelector("a").setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if (item.hasSubmenu) item.expanded = false;
        })
      }

    } else if (prop === "href") {
      this.shadowRoot.querySelector("a").href = value;
    }
  }

}

customElements.define("desktop-menu-item", MenuItem);