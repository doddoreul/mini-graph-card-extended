class MiniGraphCardExtended extends HTMLElement {
  setConfig(config) {
    if (!config.entity_primary || !config.entities) {
      throw new Error("'entity_primary' and 'entities' keys are missing");
    }
    this.config = config;

    // Préparer les entities pour le graph
    this.entitiesClean = (this.config.entities || []).map(e => {
      if (e.entity === this.config.entity_primary) {
        return { ...e, show_state: false };
      }
      if (this.config.entity_secondary && e.entity === this.config.entity_secondary) {
        return { ...e, show_state: false };
      }
      return e;
    });

    // Créer le mini-graph-card **une seule fois**
    this.graphCard = document.createElement("mini-graph-card");
    this.graphCard.setConfig({
      ...this.config,
      entities: this.entitiesClean,
      show: { ...(this.config.show || {}), name: false, icon: false, state: false, group: false }
    });

    // Construire le shadow DOM
    this.attachShadow({ mode: "open" });
    const name = this.config.name || "";
    const icon = this.config.icon || "";
    this.shadowRoot.innerHTML = `
      <ha-card class="custom-mini-graph-card">
        <div class="header-top">
          <span class="header-title">${name}</span>
          ${icon ? `<ha-icon icon="${icon}" class="header-icon"></ha-icon>` : ""}
        </div>
        <div class="header-values">
          <div class="primary"><span class="value" id="primary-value"></span><span class="unit" id="primary-unit"></span></div>
          ${this.config.entity_secondary ? `<div class="secondary"><span class="value" id="secondary-value"></span><span class="unit" id="secondary-unit"></span></div>` : ""}
        </div>
        <div class="graph"></div>
      </ha-card>

      <style>
        ha-card {
          padding: 16px 0 0;
          font-family: var(--paper-font-body1_-_font-family, inherit);
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
          background: var(--card-background-color, white);
        }
        ha-card .info.flex{
            padding: 0 16px 16px;
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
        .primary .value { font-size: 2.4rem; font-weight: 300; }
        .primary .unit { font-size: 1.2rem; opacity: 0.65; }
        .secondary .value { font-size: 1.2rem; font-weight: 300; color: var(--secondary-text-color); }
        .secondary .unit { font-size: 0.8rem; opacity: 0.65; }
        .graph { margin-top: 8px; }
        @media (max-width: 420px) {
          .primary .value { font-size: 2rem; }
          .primary .unit { font-size: 0.9rem; }
          .secondary .value { font-size: 1rem; }
          .secondary .unit { font-size: 0.7rem; }
        }
      </style>
    `;

    // Ajouter le graph à l'emplacement
    this.shadowRoot.querySelector(".graph").appendChild(this.graphCard);
  }

  set hass(hass) {
    if (!this.config || !hass) return;

    const primaryEntity = hass.states[this.config.entity_primary];
    const secondaryEntity = this.config.entity_secondary ? hass.states[this.config.entity_secondary] : null;

    if (!primaryEntity) return;

    // Mettre à jour les valeurs dans le header
    this.shadowRoot.getElementById("primary-value").textContent = primaryEntity.state;
    this.shadowRoot.getElementById("primary-unit").textContent = primaryEntity.attributes.unit_of_measurement || "";

    if (secondaryEntity) {
      this.shadowRoot.getElementById("secondary-value").textContent = secondaryEntity.state;
      this.shadowRoot.getElementById("secondary-unit").textContent = secondaryEntity.attributes.unit_of_measurement || "";
    }

    // Mettre à jour le graph
    this.graphCard.hass = hass;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define("mini-graph-card-extended", MiniGraphCardExtended);
