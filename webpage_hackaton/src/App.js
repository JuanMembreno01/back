import React, { useState } from 'react';
import './App.css';
import Filters from './componentes/filtro';
import GraphVisualization from './componentes/GraphVisualization';
import mapaUnitec from './imagenes/Captura de pantalla 2024-06-06 141121.png';

const containerStyle = {
  width: '100%',
  height: '400px'
};

function App() {
  const [filtros, setFiltros] = useState({
    dia: '',
    hora: '',
    carreraUniversitaria: '',
    facultad: '',
    nivelDetalle: 'classroom',
    edificio: ''
  });

  const [filtrosValidos, setFiltrosValidos] = useState(false);

  const handleFiltrosChange = (newFiltros) => {
    setFiltros(newFiltros);
  };

  const handleApplyFilters = () => {
    const { dia, hora, carreraUniversitaria, facultad, nivelDetalle } = filtros;
    const isFiltrosValidos = dia && hora && (carreraUniversitaria || facultad) && nivelDetalle;
    setFiltrosValidos(isFiltrosValidos);
    console.log("Filtros aplicados:", filtros);
  };

  return (
    <div className="App">
      <Filters filtros={filtros} onFiltrosChange={handleFiltrosChange} onApplyFilters={handleApplyFilters} />
      <div className="map-container">
        <img src={mapaUnitec} alt='mapa_unitec' style={containerStyle} />
      </div>
      {filtrosValidos ? <GraphVisualization filtros={filtros} /> : <p>Por favor, seleccione todos los filtros requeridos y haga clic en "Aplicar Filtros".</p>}
    </div>
  );
}

export default App;
