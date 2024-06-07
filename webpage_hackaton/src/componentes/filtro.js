import React, { useState, useEffect } from 'react';
import './filtro.css';

const Filtros = ({ filtros, onFiltrosChange, onApplyFilters }) => {
  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [opcionesFiltro, setOpcionesFiltro] = useState({
    dias: [],
    horas: [],
    carrerasUniversitarias: [],
    facultades: [],
    edificios: []
  });

  const diasMap = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábado'
  };

  const diasInversoMap = {
    'Lunes': '1',
    'Martes': '2',
    'Miércoles': '3',
    'Jueves': '4',
    'Viernes': '5',
    'Sábado': '6'
  };

  useEffect(() => {
    fetch('http://localhost:3001/filters')
      .then(response => response.json())
      .then(data => {
        const uniqueDias = [...new Set(data.dias.join('').split(''))]
          .filter(dia => diasMap[dia])
          .map(dia => diasMap[dia]);

        setOpcionesFiltro({
          dias: uniqueDias,
          horas: data.horas,
          carrerasUniversitarias: data.carreras,
          facultades: data.facultades,
          edificios: data.edificios
        });
      })
      .catch(error => {
        console.error('Error fetching filter options:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFiltros({ ...localFiltros, [name]: value });
  };

  const handleApplyFilters = () => {
    onFiltrosChange(localFiltros);
    onApplyFilters();
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <h3>Por Tiempo</h3>
        <label>Día:</label>
        <select name="dia" value={localFiltros.dia} onChange={handleChange} required>
          <option value="">Seleccionar día</option>
          {opcionesFiltro.dias.map((dia, index) => (
            <option key={index} value={diasInversoMap[dia]}>{dia}</option>
          ))}
        </select>
        
        <label>Hora:</label>
        <select name="hora" value={localFiltros.hora} onChange={handleChange} required>
          <option value="">Seleccionar hora</option>
          {opcionesFiltro.horas.map((hora, index) => (
            <option key={index} value={hora}>{hora}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <h3>Por Agrupaciones</h3>
        <label>Carrera Universitaria:</label>
        <select name="carreraUniversitaria" value={localFiltros.carreraUniversitaria} onChange={handleChange}>
          <option value="">Seleccionar</option>
          {opcionesFiltro.carrerasUniversitarias.map((carrera, index) => (
            <option key={index} value={carrera}>{carrera}</option>
          ))}
        </select>
        
        <label>Facultad:</label>
        <select name="facultad" value={localFiltros.facultad} onChange={handleChange}>
          <option value="">Seleccionar</option>
          {opcionesFiltro.facultades.map((facultad, index) => (
            <option key={index} value={facultad}>{facultad}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h3>Por Detalles</h3>
        <label>Nivel de detalle:</label>
        <select name="nivelDetalle" value={localFiltros.nivelDetalle} onChange={handleChange} required>
          <option value="classroom">Aula</option>
          <option value="building">Edificio</option>
        </select>
        
        
      </div>

      <button onClick={handleApplyFilters} className="apply-filters-button">Aplicar Filtros</button>
    </div>
  );
};

export default Filtros;
