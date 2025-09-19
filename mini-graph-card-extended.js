class MiniGraphCardExtended extends HTMLElement {
  setConfig(config) {
    if (!config.entity_primary || !config.entities) {
      throw new Error("'entity_primary' and 'entities' keys are missing");
    }
    this.config = config;
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    if (!this.config) return;

    const primaryEntity = hass.states[this.config.entity_primary];
    const secondaryEntity = this.config.entity_secondary ? hass.states[this.config.entity_secondary] : null;

    if (!primaryEntity) {
      this.shadowRoot.innerHTML = `<ha-card><div class="error">'entity_primary' not set</div></ha-card>`;
      return;
    }

    const primaryValue = primaryEntity.state;
    const primaryUnit = primaryEntity.attributes.unit_of_measurement || "";

    const secondaryValue = secondaryEntity ? secondaryEntity.state : null;
    const secondaryUnit = secondaryEntity ? secondaryEntity.attributes.unit_of_measurement || "" : null;

    const name = this.config.name || "";
    const icon = this.config.icon || "";

    // HTML
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header-top">
          <span class="header-title">${name}</span>
          ${icon ? `<ha-icon icon="${icon}" class="header-icon"></ha-icon>` : ""}
        </div>
        <div class="header-values">
          <div class="primary">
            <span class="value">${primaryValue}</span>
            <span class="unit">${primaryUnit}</span>
          </div>
          ${secondaryEntity ? `<div class="secondary">
            <span class="value">${secondaryValue}</span>
            <span class="unit">${secondaryUnit}</span>
          </div>` : ""}
        </div>
        <div class="graph"></div>
      </ha-card>

      <style>
        ha-card {
          padding: 0;
          font-family: var(--paper-font-body1_-_font-family, inherit);
          border: none;
          background: var(--card-background-color, white);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 4px 16px 8px;
        }

        .header-title {
          font-size: 1.2rem;
          font-weight: 500;
          opacity: 0.65;
          color: var(--primary-text-color);
        }

        .header-icon {
          width: 20px;
          height: 20px;
          color: var(--state-icon-color, #44739e);
        }

        .header-values {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin: 0 16px 12px;
        }

        .primary, .secondary {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .primary .value {
          font-size: 2.4rem;
          font-weight: 300;
        }
        .primary .unit {
          font-size: 1.2rem;
          opacity: 0.65;
        }

        .secondary .value {
          font-size: 1.2rem;
          font-weight: 300;
          color: var(--secondary-text-color);
        }
        .secondary .unit {
          font-size: 0.8rem;
          opacity: 0.65;
        }

        .graph {
          margin-top: 8px;
        }
      </style>
    `;

    const entitiesClean = (this.config.entities || []).map(e => {
      if (e.entity === this.config.entity_primary) {
        return { ...e, show_state: false };
      }
      if (this.config.entity_secondary && e.entity === this.config.entity_secondary) {
        return { ...e, show_state: false };
      }
      return e;
    });

    const graphCard = document.createElement("mini-graph-card");
    graphCard.setConfig({
      ...this.config,
      entities: entitiesClean,
      show: { ...(this.config.show || {}), name: false, icon: false, state: false, group: true }
    });
    this.shadowRoot.querySelector(".graph").appendChild(graphCard);
    graphCard.hass = hass;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define("mini-graph-card-extended", MiniGraphCardExtended);
