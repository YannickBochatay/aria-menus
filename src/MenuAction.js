import MenuElement from "./MenuElement.js";

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <span role="menuitem" tabindex="-1">
      <span aria-hidden="true" class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="label">
        <slot></slot>
      </span>
      <span class="info">
        <slot name="info"></slot>
      </span>
    </span>
  </li>
`

export default class MenuAction extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "focusable"];

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  get focusable() {
    return this.hasAttribute("focusable");
  }

  set focusable(value) {
    if (value) this.setAttribute("focusable", "");
    else this.removeAttribute("focusable");
  }

  #handleKeyNavigation = e => {
    if (this.disabled) return;

    switch (e.key) {
      case "Enter": case " ":
        this.dispatchEvent(new Event("click", { target : this }));
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.#handleKeyNavigation);
  }
}
