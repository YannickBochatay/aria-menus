const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([active]) li {
    background-color:rgb(229, 236, 255);
  }
  li {
    margin:0;
    white-space:nowrap;
    line-height:1.5;
    padding:2px 5px;
    cursor:default;
    display:flex;
    align-items:center;
    color:#333;
    position:relative;
    width:100%;
    box-sizing:border-box;

    a {
      text-decoration:none;
      color:inherit;
    }
    
  }

  .icon {
    width:16px,
    margin-right:5;
    color:black;
  }

  [disabled] {
    color:gray;
    font-style:italic;
    cursor:not-allowed;
  }

  .disabledActive {
    background-color:#eee;
  }

  .info {
    color:gray;
  }

  .label {
    margin-right:15px;
    flex:1;
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
      <span class="icon"></span>
      <span class="label"></span>
      <span class="info"></span>
    </a>
    <slot hidden></slot>
    <span class="arrow" hidden>▶</span>
  </li>
`


export default class MenuItem extends HTMLElement {

  #timeoutId
  #root

  static observedAttributes = ["expanded"];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode : "open" });
    this.#root.adoptedStyleSheets = [style];
    this.#root.append(template.content.cloneNode(true));
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get expanded() {
    const attr = this.#root.querySelector("li").getAttribute("aria-expanded");
    return attr === "true";
  }

  set expanded(bool) {
    if (typeof bool !== "boolean") throw new TypeError("expanded value must be a boolean");

    this.#root.querySelector("slot").hidden = !bool;
    this.#root.querySelector("li").setAttribute("aria-expanded", String(bool));

    if (!bool) {
      this.querySelectorAll("desktop-menu-item").forEach(item => {
        item.active = false;
        item.expanded = false;
      })
    }
  }

  get hasSubmenu() {
    return this.children.length > 0;
  }

  connectedCallback() {
    this.#root.querySelector(".label").textContent = this.getAttribute("label");

    if (this.hasSubmenu) {
      const li = this.#root.querySelector("li");
      li.querySelector(".arrow").hidden = false;
      li.setAttribute("aria-haspopup", "true");
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "expanded") {
      this.expanded = (value != null);
    }
  }

}

customElements.define("desktop-menu-item", MenuItem);