import MenuElement from "./MenuElement.js"
import MenuList from "./MenuList.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([direction=column]) li {
    padding:0.3rem 1rem;
    
    .arrow {
      transform:rotate(90deg);
    }

    slot[name=menu]::slotted(*) {
      position:absolute;
      top:100%;
      margin-left:-1em;
    }
  }
  :host([direction=column][expanded]) {
    .arrow {
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
      <span class="info">
        <slot name="info"></slot>
      </span>
    </a>
    <slot name="menu" hidden></slot>
    <span class="arrow" hidden>▶</span>
  </li>
`

export default class MenuItem extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "expanded" ,"href", "focusable"];

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets.push(style);
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

  get focusable() {
    return this.hasAttribute("focusable");
  }

  set focusable(value) {
    if (value) this.setAttribute("focusable", "");
    else this.removeAttribute("focusable");
  }

  get info() {
    return this.getAttribute("info");
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

  #handleKeyNavigation = e => {
    const expandKey = (this.direction === "column") ? "ArrowDown" : "ArrowRight"
    const hideKey = (this.direction === "column") ? null : "ArrowLeft"

    switch (e.key) {

      case hideKey: case "Escape":
        if (this.expanded) {
          e.stopPropagation();
          this.expanded = false;
          this.active = true;
        }
        break;

      case expandKey: case "Enter": case " ":
        if (!this.expanded) {
          e.preventDefault();
          e.stopPropagation();
          this.expanded = true;
          this.#findMenuList().activeItem(0);
        }
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();

    const a = this.shadowRoot.querySelector("a");

    a.addEventListener("click", e => {
      if (!this.href || this.disabled) e.preventDefault();
      if (!this.disabled && !this.hasSubmenu) {
        this.dispatchEvent(new CustomEvent("select", { detail : { originalEvent : e } }));
      }
    });

    if (this.hasSubmenu) {
      this.shadowRoot.querySelector(".arrow").hidden = false;

      a.setAttribute("aria-haspopup", "true");
      a.setAttribute("aria-expanded", "false");

      this.addEventListener("keydown", this.#handleKeyNavigation);
    }

    if (this.info) {
      this.shadowRoot.querySelector(".info").textContent = this.info;
    }
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.#handleKeyNavigation);
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => node instanceof MenuElement)
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

    } else if (prop === "focusable") {
      this.shadowRoot.querySelector("a").tabIndex = (value == null) ? -1 : 0;

    } else if (prop === "href") {
      this.shadowRoot.querySelector("a").href = value;

    }
  }

}
