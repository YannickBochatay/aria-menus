const template = document.createElement("template");
template.innerHTML = `
  <style>
  :host {
    display:none;
    position:fixed;
  }
  </style>
  <slot></slot>
`

export default class ContextMenu extends HTMLElement {

  constructor() {
    super()
    const root = this.attachShadow({ mode : "open" });
    root.append(template.content.cloneNode(true));
  }

  get target() {
    return document.querySelector("#" + this.getAttribute("for"));
  }

  close() {
    this.style.display = "none";
    this.target.setAttribute("aria-expanded", false);
  }

  open(e) {
    this.style.display = "inline-block";
    const {x,y} = this.#computePosition(e);
    this.style.left = x + "px";
    this.style.top = y + "px";
    this.target.setAttribute("aria-expanded", true);
  }

  #handleBlurWindow = () => this.close()

  #handleClickDoc = e => {
    if (!(this.contains(e.target))) this.close();
  }

  #computePosition(e) {

    const rect = this.getBoundingClientRect();
    const clientX = e?.clientX ?? rect.left;
    const clientY = e?.clientY ?? rect.top;
    let x = clientX;
    let y = clientY;

    if (clientX + rect.width > window.innerWidth) {
      x -= rect.width
      if (x < 0) x = window.innerWidth - rect.width
    }

    if (clientY + rect.height > window.innerHeight) {
      y -= rect.height
      if (y < 0) y = window.innerHeight - rect.height
    }

    return { x, y };
  }

  #handleContextMenu = e => {
    e.preventDefault();
    this.open(e);
  }

  connectedCallback() {
    document.addEventListener("mousedown", this.#handleClickDoc);
    window.addEventListener("blur", this.#handleBlurWindow);
    this.target.addEventListener("contextmenu", this.#handleContextMenu);
  }

  disconnectedCallback() {
    document.removeEventListener("mousedown", this.#handleClickDoc);
    window.removeEventListener("blur", this.#handleBlurWindow);
    this.target.removeEventListener("contextmenu", this.#handleContextMenu);
  }

}

customElements.define("desktop-contextmenu", ContextMenu);

