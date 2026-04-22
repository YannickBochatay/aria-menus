const style = new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    display:flex;
    & > section {
      flex:1;
    }
  }
`);

const template = document.createElement("template");

template.innerHTML = `
  <section>
    <h5>Code</h5>
    <code-snippet language="html"></code-snippet>
  </section>
  <section>
    <h5>Render</h5>
    <slot></slot>
  </section>
`

class Snippet extends HTMLElement {

  constructor() {
    super()
    const root = this.attachShadow({ mode : "open" });
    root.append(template.content.cloneNode(true));
    root.adoptedStyleSheets = [style];
  }

  connectedCallback() {
    this.shadowRoot.querySelector("code-snippet").textContent = this.firstElementChild.outerHTML;
  }
}

customElements.define("menu-snippet", Snippet);