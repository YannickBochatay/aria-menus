import MenuElement, { labelTemplate } from "./MenuElement.js";
import MenuList from "./MenuList.js";

const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  .caret {
    font-size:0.6rem;
    margin-left:var(--margin-left);
    cursor:default;
  }
  :host([direction=column]) li {
    padding:0.3rem 1rem;
    
    .caret {
      transform:rotate(90deg);
    }

    slot[name=menu]::slotted(*) {
      position:absolute;
      top:100%;
      margin-left:-1em;
    }
  }
  :host([direction=column][expanded]) {
    .caret {
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
    <span role="menuitem" tabindex="-1" aria-haspopup="true" aria-expanded="false">
      ${labelTemplate}
    </span>
    <span class="caret">▶</span>
    <slot name="menu" hidden></slot>
  </li>
`

export default class MenuSub extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "expanded"];

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
    this.addEventListener("keydown", this.#handleKeyNavigation);

    if (!this.hasAttribute("direction")) this.direction = "row";
  }

  #findAllItems() {
    return [...this.querySelectorAll("*")].filter(node => node instanceof MenuElement)
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);

    const menuItem = this.shadowRoot.querySelector("[role=menuitem]")

    if (prop === "expanded") {
      const bool = (value != null);
      this.shadowRoot.querySelector("slot[name=menu]").hidden = !bool;
      menuItem.setAttribute("aria-expanded", String(bool));

      if (!bool) {
        this.#findAllItems().forEach(item => {
          item.active = false;
          if ("expanded" in item) item.expanded = false;
        })
      }
    }
  }

}
