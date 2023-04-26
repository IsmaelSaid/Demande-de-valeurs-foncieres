import { Control, DomEvent, DomUtil,Map } from "leaflet";

export class btn extends Control{
    override onAdd(map: Map): HTMLElement {
        let conteneur = DomUtil.create(
            'div',
            'col mx-auto leaflet-bar leaflet-control barre'
          );
          conteneur.id = 'barre';
          DomEvent.disableClickPropagation(conteneur);
      
          let button1 = DomUtil.create(
            'button1',
            'btn btn-outline-dark',
            conteneur
          );
          button1.innerHTML = '<i class="fas fa-chart-pie"></i>';
          button1.title = 'liste';
          button1.innerText = "click1"
          let button2 = DomUtil.create(
            'button',
            'btn btn-outline-dark',
            conteneur
          );
          button2.innerText = "click2"
        return conteneur
    }

    override onRemove(map: Map): void {
        
    }
}

  