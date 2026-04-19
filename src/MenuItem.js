import MenuElement, { labelTemplate } from "./MenuElement.js";

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <span role="menuitem" tabindex="-1">
      ${labelTemplate}
    </span>
  </li>
`

export default class MenuItem extends MenuElement {

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
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
