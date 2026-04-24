const style = new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    display:flex;
    justify-content:stretch;
    flex-wrap:wrap;
    & > section {
      flex:1;
      
      &:last-child {
        display:flex;
        flex-direction:column;
        & > div {
          border:1px solid #ccc;
          padding:1rem;
          flex:1;
        }
      }
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
    <div>
      <slot></slot>
    </div>
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
    const code = this.shadowRoot.querySelector("code-snippet")
    code.textContent = [...this.children].reduce((html, node) => html + "\n" + node.outerHTML, "").trim();
  }
}

customElements.define("menu-snippet", Snippet);