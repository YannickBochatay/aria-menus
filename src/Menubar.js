import Menu from "./Menu.js"

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  ul {
    list-style:none;
    margin:0;
    padding:0;
  }
  li {
    display:inline-block;
    padding:0.2em 0.5em;
    cursor:default;
    margin:0;
  }
  ::slotted(desktop-menu) {
    position:absolute;
    margin-left:-0.5em;
  }
}`);

const template = document.createElement("template");

template.innerHTML = `
  <ul role="menubar">
    <slot></slot>
  </ul>
`;

export default class MenuBar extends HTMLElement {

  static observedAttributes = ["active", "expanded"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }

  get menus() {
    return Array.from(this.children).filter(menu => (menu instanceof Menu) && !menu.disabled);
  }

  #findMenuByLabel(label) {
    return this.menus.find(menu => menu.getAttribute("label") === label);
  }

  connectedCallback() {
    this.menus.forEach(menu => {
      const li = document.createElement("li");
      li.role = "none";
      li.textContent = menu.getAttribute("label");
      this.shadowRoot.append(li)
      menu.style.display = "none";
    });
    this.shadowRoot.addEventListener("click", e => {
      const menu = this.#findMenuByLabel(e.target.textContent);
      if (menu) menu.style.display = "inline-block";
    })
  }

}

customElements.define("desktop-menubar", MenuBar);
