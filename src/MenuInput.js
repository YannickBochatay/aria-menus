import MenuElement, { labelTemplate } from "./MenuElement.js";

const template = document.createElement("template");
template.innerHTML = `
  <li role="none">
    <span role="menuitemcheckbox" aria-checked="false" tabindex="-1">
      ${labelTemplate}
    </span>
  </li>
`

export default class MenuInput extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "disabled", "checked"];

  #menuitem

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
    this.#menuitem = this.shadowRoot.querySelector("[role^=menuitem]");
  }

  get value() {
    return this.getAttribute("value") || this.#menuitem.textContent;
  }

  get label() {
    return this.getAttribute("label") || this.value;
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(value) {
    this.setAttribute("name", value);
  }

  get checked() {
    return this.hasAttribute("checked");
  }

  set checked(value) {
    if (value) this.setAttribute("checked", "")
    else this.removeAttribute("checked");
  }

  click = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event("change", { target : this }));
  }

  #handleKeyDown = e => {
    if (this.active && e.key === "Enter" || e.key === " ") {
      this.click()
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.click);
    this.addEventListener("keydown", this.#handleKeyDown);
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(prop, prevValue, value);
    if (prop === "checked") {
      this.#menuitem.setAttribute("aria-checked", value == null ? "false" : "true");
    }
  }
}
