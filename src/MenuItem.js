const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([active]) li {
    background-color:rgb(229, 236, 255);
  }
  :host([disabled]) li {
    color:gray;
    font-style:italic;
    cursor:not-allowed;
  }
  ::slotted([slot=icon]) {
    width:18px;
    vertical-align:middle;
  }
  li {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size:1rem;
    margin:0;
    padding:2px 5px;
    color:#333;
    position:relative;
    width:100%;
    box-sizing:border-box;
    display:flex;
    align-items:center;

    a {
      text-decoration:none;
      color:inherit;
      display:flex;
      align-items:center;
      cursor:default;
      flex:1;

      .icon {
        width:18px;
        margin-right:5px;
        display:inline-block;
      }
      
      .label {
        margin-right:15px;
        white-space:nowrap;
        flex:1;
      }

      .info {
        color:gray;
        font-size:0.9rem;
      }
    }
    
  }

  .arrow {
    font-size:9px;
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
      <span class="info">
        <slot name="info"></slot>
      </span>
    </a>
    <slot name="submenu" hidden></slot>
    <span class="arrow" hidden>▶</span>
  </li>
`


export default class MenuItem extends HTMLElement {

  #root

  static observedAttributes = ["expanded", "active"];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode : "open" });
    this.#root.adoptedStyleSheets = [style];
    this.#root.append(template.content.cloneNode(true));
  }

  get label() {
    return this.getAttribute("label");
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

  #hasSubmenu() {
    return Boolean(this.querySelector("[slot=submenu]"));
  }

  #isLastExpanded() {
    const subItems = this.querySelectorAll("desktop-menu-item");
    return !subItems || [...subItems].every(item => !item.expanded);
  }

  #handleKeyDown = e => {
    if (!this.active || this.assignedSlot?.hidden || !this.#hasSubmenu() || !this.#isLastExpanded()) return;

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
    this.#root.querySelector(".label").textContent = this.getAttribute("label");

    if (this.#hasSubmenu()) {
      const li = this.#root.querySelector("li");
      li.querySelector(".arrow").hidden = false;

      const a = this.#root.querySelector("a");
      a.setAttribute("aria-haspopup", "true");
      a.setAttribute("aria-expanded", "false");

      document.addEventListener("keydown", this.#handleKeyDown);
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#handleKeyDown);
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded") {
      this.expanded = (value != null);
    } else if (prop === "active") {
      if (value != null) this.#root.querySelector("a").focus();
    }
  }

}

customElements.define("desktop-menu-item", MenuItem);