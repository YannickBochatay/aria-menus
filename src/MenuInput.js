import MenuElement from "./MenuElement.js";

export const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([type=radio]) [aria-checked=true] .icon::before {
    content:"●";
  }
  :host([type=checkbox]) [aria-checked=true] .icon::before {
    content:"✓";
  }
`);

const template = document.createElement("template");
template.innerHTML = `
  <li role="menuitemcheckbox" aria-checked="false">
    <span class="focusedElmt" tabindex="-1">
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

export default class MenuInput extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "disabled", "checked", "type"];

  #li

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets.push(style);
    this.shadowRoot.append(template.content.cloneNode(true));
    this.#li = this.shadowRoot.querySelector("li");
  }

  get type() {
    return this.getAttribute("type") || "checkbox";
  }

  set type(value) {
    if (!["radio", "checkbox"].includes(value)) throw new Error("type value must be radio or checkbox");
    this.setAttribute("type", value);
  }

  get value() {
    return this.getAttribute("value") || this.#li.textContent;
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

    if (!this.hasAttribute("type")) this.type = "checkbox";
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(prop, prevValue, value);

    if (prop === "checked") {
      if (value != null && this.type === "radio") {
        this.parentNode.querySelectorAll(`[name="${this.name}"]`).forEach(item => {
          if (item !== this) item.checked = false;
        })
      }
      this.#li.setAttribute("aria-checked", value == null ? "false" : "true");

    } else if (prop === "type") {
      this.#li.setAttribute("role", "menuitem" + value);
    }
  }
}
