import React, { useState, useEffect } from 'react';
import { Graph } from 'react-d3-graph';

const myConfig = {
    nodeHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue'
    },
    link: {
        highlightColor: 'lightblue'
    },
    directed: true,
};

const validateGraphData = (data) => {
    if (!data.nodes || !Array.isArray(data.nodes)) return false;
    if (!data.links || !Array.isArray(data.links)) return false;
    for (const node of data.nodes) {
        if (!node.id) return false;
    }
    for (const link of data.links) {
        if (!link.source || !link.target) return false;
    }
    return true;
};

const GraphVisualization = ({ filtros }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/graph-data?dia=${filtros.dia}&hora=${filtros.hora}&carreraUniversitaria=${filtros.carreraUniversitaria}&facultad=${filtros.facultad}&nivelDetalle=${filtros.nivelDetalle}&edificio=${filtros.edificio}`);
                const data = await response.json();
                
                console.log('Fetched graph data:', data);
                if (validateGraphData(data)) {
                    setGraphData(data);
                } else {
                    console.error('Invalid graph data structure:', data);
                }
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };

        fetchGraphData();
    }, [filtros]);

    return (
        <div className="graph-visualization">
            <Graph
                id="graph-id"
                data={graphData}
                config={myConfig}
            />
        </div>
    );
};

export default GraphVisualization;
