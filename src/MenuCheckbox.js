import MenuElement from "./MenuElement.js";

export const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  li {
    label {
      flex:1;
    }

    input:focus {
      outline:none;
    }
  }
    :host
`);

const template = document.createElement("template");
template.innerHTML = `
  <li role="none">
    <input type="checkbox" id="checkbox" class="focusedElmt icon">
    <label for="checkbox" class="label" role="menuitem">
      <slot></slot>
    </label>
  </li>
`

export default class MenuCheckbox extends MenuElement {

  #input

  static observedAttributes = [...MenuElement.observedAttributes, "disabled"];

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets.push(style);
    this.shadowRoot.append(template.content.cloneNode(true));
    this.#input = this.shadowRoot.querySelector("input");
  }

  get checked() {
    return this.#input.checked;
  }

  #handleKeyDown = e => {
    if (this.active && e.key === "Enter") {
      this.#input.checked = !this.#input.checked;
      this.#input.dispatchEvent(new Event("change", { target : this }));
    }
  }

  connectedCallback() {
    this.#input.addEventListener("change", e => {
      this.dispatchEvent(new CustomEvent("change", { detail : { originalEvent : e } }));
    });

    document.addEventListener("keydown", this.#handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#handleKeyDown);
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);

    if (prop === "disabled") {
      this.#input.disabled = (value != null);
    }
  }

}

customElements.define("desktop-menu-checkbox", MenuCheckbox);